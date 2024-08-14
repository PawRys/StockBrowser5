<?php
// header('Access-Control-Allow-Origin: https://pawrys.github.io');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// set_error_handler('handleError');

function handleError($errno, $errstr, $errfile, $errline) {
  http_response_code(500); // Internal Server Error
  $errorData = [
    'error' => [
      'code' => $errno,
      'message' => $errstr,
      'file' => $errfile,
      'line' => $errline,
      'post_data' => json_decode(file_get_contents('php://input'))
    ]
  ];
  echo json_encode($errorData);
  exit();
}

$rawPostData = file_get_contents('php://input');
$POST_data = json_decode($rawPostData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON data'
    ]);
    exit();
}

# delete files older than 2 minutes
$VAULT = './exchange_vault';
$FILES = scandir($VAULT);

for ($i = 2; $i < count($FILES); $i++) {
	$fileage = time() - filemtime("$VAULT/$FILES[$i]");
	if ($fileage > 120) {
		// unlink("$VAULT/$FILES[$i]");
	}
}

if ($POST_data['action'] == 'provide') {
  $randomNumber = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
  $response = [];
  $response['pincode'] = $randomNumber;
  $stockData = $POST_data['stockData'];
    
	// echo password_hash($_POST['password'], PASSWORD_BCRYPT);
	$hash = '$2y$10$NVT.pWG0PQWtV9KrsSfEHOHb0j3K.JoroXFGsq3n4B5p1ajMxWtLu';
	if (password_verify($POST_data['password'], $hash)) {
    $response['password_verify'] = true;
	} else {
    $response['password_verify'] = false;
    
    foreach ($stockData['stockList'] as $k => $v) {
      $stockData['stockList'][$k]["price"] = 0;
    }
  }
  
  $fileToSaveTo = fopen("$VAULT/$randomNumber.txt", 'w');
	fwrite($fileToSaveTo, json_encode($stockData, JSON_UNESCAPED_UNICODE));
	fclose($fileToSaveTo);
	echo json_encode($response);
}

if ($POST_data['action'] == 'request') {
  $response = [];

	$pinCode = $POST_data['pin'];
  $fileName = "$VAULT/$pinCode.txt";
	if (file_exists($fileName)) {
    $response['message'] = 'data_transmitted';
    $response['data'] = file_get_contents($fileName);
		// unlink($fileName);
	} else {
    $response['message'] = 'data_not_exist';
	}
	echo json_encode($response);
}
