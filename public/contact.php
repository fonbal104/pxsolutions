<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method']);
    exit;
}

$configFile = __DIR__ . '/contact-config.php';

if (!is_file($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'config']);
    exit;
}

require $configFile;

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid']);
    exit;
}

$name    = trim((string)($input['name'] ?? ''));
$email   = trim((string)($input['email'] ?? ''));
$phone   = trim((string)($input['phone'] ?? ''));
$message = trim((string)($input['message'] ?? ''));
$token   = trim((string)($input['token'] ?? ''));

if (
    $name === '' ||
    $message === '' ||
    $token === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid']);
    exit;
}

if (
    strlen($name) > 200 ||
    strlen($email) > 320 ||
    strlen($phone) > 100 ||
    strlen($message) > 10000
) {
    http_response_code(400);
    echo json_encode(['error' => 'too_long']);
    exit;
}

/*
 * Verify Google reCAPTCHA server-side.
 */
$verify = curl_init(
    'https://www.google.com/recaptcha/api/siteverify'
);

curl_setopt_array($verify, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'secret'   => RECAPTCHA_SECRET,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
]);

$result = curl_exec($verify);
$curlError = curl_error($verify);

curl_close($verify);

if ($result === false || $curlError !== '') {
    http_response_code(502);
    echo json_encode(['error' => 'captcha_service']);
    exit;
}

$captcha = json_decode($result, true);

if (empty($captcha['success'])) {
    http_response_code(400);
    echo json_encode(['error' => 'captcha']);
    exit;
}

/*
 * Send email.
 */
$to = 'info@pxsolutions.co.jp';

$from = defined('MAIL_FROM')
    ? MAIL_FROM
    : 'PX Solutions <noreply@pxsolutions.co.jp>';

$subject = '【お問い合わせ】' . $name . '様';

$body =
    "お名前: {$name}\n" .
    "メール: {$email}\n" .
    "電話: {$phone}\n\n" .
    "{$message}";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $from,
    'Reply-To: ' . $email,
];

$sent = mail(
    $to,
    $subject,
    $body,
    implode("\r\n", $headers)
);

if (!$sent) {
    http_response_code(500);
    echo json_encode(['error' => 'send']);
    exit;
}

echo json_encode(['ok' => true]);