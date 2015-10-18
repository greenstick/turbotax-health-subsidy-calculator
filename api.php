<?php
// Require Composer / Slim Autoloader
require 'vendor/autoload.php';

// Instantiate SlimPHP Application
$app = new \Slim\Slim(array(
    'debug' => true
));

// 
$app->hook('slim.before', function () use ($app) {
	$app->contentType('application/json');
});

// Get Subsidy
$app->get('/getSubsidy/:json', function ($json) use ($app) {
	$response 		= "";
	$jsonData 		= json_decode($json);
	$eHealthURL 	= "https://api.ehealth.com/v1/subsidy/estimate?";
	$queryString 	= "";
	$jsonData = json_decode($json);
	if (isset($jsonData->tax_family_size)) {
		$queryString .= 'tax_family_size=' . urlencode($jsonData->tax_family_size) . '&';
	}
	if (isset($jsonData->primary_dob)) {
		$queryString .= 'primary_dob=' . urlencode($jsonData->primary_dob) . '&';
	}
	if (isset($jsonData->spouse_dob)) {
		$queryString .= 'spouse_dob=' . urlencode($jsonData->spouse_dob) . '&';
	}
	if (isset($jsonData->children_dob)) {
		$queryString .= 'children_dob=' . urlencode($jsonData->children_dob) . '&';
	}
	if (isset($jsonData->income)) {
		$queryString .= 'income=' . urlencode($jsonData->income) . '&';
	}
	if (isset($jsonData->zip_code)) {
		$queryString .= 'zip_code=' . urlencode($jsonData->zip_code);
	}
	// Set URL & Query
	$url 			= $eHealthURL . $queryString;
	// Init Connection Object
	$connection 	= curl_init();
	// Set Options
	curl_setopt($connection, CURLOPT_URL, $url);
	curl_setopt($connection, CURLOPT_HTTPHEADER, array(
		"apikey: 8b0ll6sbxU6w2V17nVzFPukAkznpu8fc",
		"Accept: application/json",
		"Cache-Control: no-cache"
	));
	curl_setopt($connection, CURLOPT_RETURNTRANSFER, 1);
	// Execute Post Request
	$response  		= curl_exec($connection);
	// Close Connection
	curl_close($connection);
	echo $response;
});

// Run API
$app->run();

?>