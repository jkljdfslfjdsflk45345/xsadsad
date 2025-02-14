<?PHP
if(isset($_GET['error'])) 
{
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}
$mysqli2 = new mysqli($_GET['localhost'], $_GET['users'], $_GET['password'], $_GET['name']);
$mysqli2->set_charset("utf8");
$_GET['query'] = ($_GET['query']);
if(isset($_GET['select'])) echo json_encode($mysqli2->query($_GET['query'])->fetch_all(MYSQLI_ASSOC));
else echo json_encode($mysqli2->query($_GET['query']));
