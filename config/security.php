<?php
/**
 * QuickWorker - Security Configuration
 * Handles CSRF protection, session management, and security utilities
 */

class Security {
    private $csrfTokenLength = 32;
    private $sessionTimeout = 3600;

    /**
     * Generate CSRF token
     */
    public function generateCsrfToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes($this->csrfTokenLength));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Verify CSRF token from request
     */
    public function verifyCsrfToken() {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? '';

        if (empty($token) || $token !== ($_SESSION['csrf_token'] ?? '')) {
            http_response_code(403);
            die(json_encode(['error' => 'CSRF token validation failed']));
        }
    }

    /**
     * Start secure session
     */
    public function startSecureSession() {
        if (session_status() === PHP_SESSION_NONE) {
            // Session configuration for security
            ini_set('session.use_only_cookies', 1);
            ini_set('session.use_strict_mode', 1);
            ini_set('session.cookie_httponly', 1);
            ini_set('session.cookie_secure', getenv('APP_ENV') === 'production' ? 1 : 0);
            ini_set('session.cookie_samesite', 'Strict');
            ini_set('session.gc_maxlifetime', $this->sessionTimeout);
            
            session_start();

            // Regenerate session ID
            if (empty($_SESSION['initiated'])) {
                session_regenerate_id(true);
                $_SESSION['initiated'] = true;
                $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'];
                $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
            }

            // Validate session security
            if ($_SESSION['ip'] !== $_SERVER['REMOTE_ADDR'] || 
                $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
                session_destroy();
                http_response_code(403);
                die(json_encode(['error' => 'Session security violation']));
            }
        }
    }

    /**
     * Rate limiting for login attempts
     */
    public function logFailedLoginAttempt($email, $ip) {
        $cacheKey = "login_attempts_{$email}_{$ip}";
        $attempts = (int)apcu_fetch($cacheKey);
        apcu_store($cacheKey, $attempts + 1, 900); // 15 minutes

        if ($attempts >= 5) {
            error_log("Suspicious login attempts from IP: $ip for email: $email");
            // Could trigger additional security measures
        }
    }

    /**
     * Audit logging
     */
    public function auditLog($userId, $action, $resourceType, $resourceId) {
        global $db;
        
        $ip = $_SERVER['REMOTE_ADDR'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->bind_param("isisis", $userId, $action, $resourceType, $resourceId, $ip, $userAgent);
        $stmt->execute();
        $stmt->close();
    }

    /**
     * Sanitize input to prevent XSS
     */
    public static function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate and sanitize SQL queries
     */
    public static function sanitizeForSQL($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeForSQL'], $input);
        }
        return stripslashes(trim($input));
    }

    /**
     * Generate secure random token
     */
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }

    /**
     * Hash password securely
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Rate limiting middleware
     */
    public function checkRateLimit($key, $limit = 60, $window = 3600) {
        $cacheKey = "ratelimit_{$key}";
        $current = (int)apcu_fetch($cacheKey);

        if ($current >= $limit) {
            http_response_code(429);
            die(json_encode(['error' => 'Too many requests']));
        }

        apcu_store($cacheKey, $current + 1, $window);
    }

    /**
     * Validate JWT token structure
     */
    public static function validateJWT($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }

        foreach ($parts as $part) {
            $decoded = base64_decode(strtr($part, '-_', '+/'), true);
            if ($decoded === false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Log security event
     */
    public static function logSecurityEvent($type, $details) {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'];
        $message = "[{$timestamp}] {$type}: {$details} (IP: {$ip})\n";
        error_log($message, 3, '/var/log/quickworker_security.log');
    }
}

/**
 * Authentication Token Handler
 */
class AuthToken {
    private static $algorithm = 'HS256';
    private static $tokenExpiry = 86400; // 24 hours

    public static function generate($userId, $email, $role) {
        $header = [
            'alg' => self::$algorithm,
            'typ' => 'JWT'
        ];

        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + self::$tokenExpiry,
            'jti' => bin2hex(random_bytes(16)) // JWT ID for token revocation
        ];

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        $signature = self::sign("{$headerEncoded}.{$payloadEncoded}");

        return "{$headerEncoded}.{$payloadEncoded}.{$signature}";
    }

    public static function verify($token) {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;

        // Verify signature
        $expectedSignature = self::sign("{$headerEncoded}.{$payloadEncoded}");
        
        if (!hash_equals($signatureEncoded, $expectedSignature)) {
            return false;
        }

        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

        if (!$payload) {
            return false;
        }

        // Check expiration
        if ($payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    private static function sign($message) {
        $secret = getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production';
        return self::base64UrlEncode(
            hash_hmac('sha256', $message, $secret, true)
        );
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        $padding = strlen($data) % 4;
        if ($padding) {
            $data .= str_repeat('=', 4 - $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}

// Initialize security
$security = new Security();
$security->startSecureSession();
?>
