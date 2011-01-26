<?php ob_start(); session_start(); ?>
<!doctype html>
<meta charset="utf-8" />
<title>Formularz</title>
<style>
	* {
		margin: 0;
		padding: 0;
	}

	html {
		overflow-y: scroll;
		font: 1em/1.625 "Trebuchet MS", Tahoma, Arial, sans-serif;
	}
	
	a {
		color: #00f;
	}
	
	body {
		margin: 5% 25%;
		width: 50%;
	}
	
	table {
		border-collapse: collapse;
		width: 100%;
	}
	
	thead {
		font-weight: bold;
	}
	
	td {
		border: 1px solid #666;
		padding: 2px;
	}
	
	label {
		display: block;
		margin-bottom: 0.5em;
	}
	label span {
		display: block;
	}
	
	input[type=text],
	input[type=password] {
		padding: 2px;
		width: 200px;
		font-size: 1em;
		background-color: #fff;
		border: 1px solid #666;
		-webkit-border-radius: 3px;
		   -moz-border-radius: 3px;
		        border-radius: 3px;
		
	}
	
	input[type=text]:focus,
	input[type=password]:focus {
		-webkit-box-shadow: 0 0 8px #ff9933;
		   -moz-box-shadow: 0 0 8px #ff9933;
		        box-shadow: 0 0 8px #ff9933;
	}
	
	input[type=submit] {
		padding: 2px;
		font-size: 1em;
	}
	
	.align-right {
		text-align: right;
	}
	
</style>
<?php

$db = new PDO('mysql:host=localhost;dbname=maze', 'root', '');

$salt = '$5as^4sgHH-/';

if (array_key_exists('logout', $_GET) AND isset($_SESSION['logged']))
{
	unset($_GET['logout']);
	unset($_SESSION['logged']);
}

$logged = isset($_SESSION['logged']);

if ($_POST)
{
	if ( ! $logged)
	{
		$query = $db->prepare('SELECT pass FROM users WHERE login=:login');
		$query->bindValue('login', $_POST['login'], PDO::PARAM_STR);
		$query->execute();
		
		if (($pass = $query->fetchColumn(0)))
		{
			$hash = sha1($salt.md5($_POST['pass']));
			
			if ($hash == $pass)
			{
				$logged = $_SESSION['logged'] = TRUE;
			}
		}
	}
}

if ($logged)
{
	$sort = 'email';
	$order = 'asc';
	
	if (isset($_GET['sort']) AND in_array($_GET['sort'], array('email', 'name', 'flaw', 'value')))
	{
		$sort = $_GET['sort'];
	}
	
	if (isset($_GET['order']) AND in_array($_GET['order'], array('asc', 'desc')))
	{
		$order = $_GET['order'];
	}
	
	if (isset($_GET['delete']))
	{
		$query = $db->prepare('DELETE FROM results WHERE id=:id');
		$query->bindValue('id', $_GET['delete'], PDO::PARAM_INT);
		$query->execute();
	}
	
	$query = $db->prepare('SELECT * FROM results ORDER BY '.$sort.' '.$order);
	$query->execute();
	
	$results = $query->fetchAll();
}

function flaw_name($flaw)
{
	$alias = array(
		'prot' => 'Protanopia',
		'deut' => 'Deuteranopia',
		'trit' => 'Tritanopia',
		'myopia' => 'Krótkowzroczność'
	);
	
	return isset($alias[$flaw]) ? $alias[$flaw] : $flaw;
}

?>
<div id="container">
	<h1>Panel administracyjny</h1>
	
	<?php if ( ! $logged): ?>
	<form action="viewer.php" method="post">
		<div>
			<p><label><span>Login:</span> <input type="text" name="login" /></label></p>
			<p><label><span>Hasło:</span> <input type="password" name="pass" /></label></p>
			<p><input type="submit" value="Zaloguj" /></p>
		</div>
	</form>
	<?php else: ?>
	<p class="align-right"><a href="?logout">Wyloguj</a></p>
	<table>
		<thead>
			<tr>
				<td><a href="?sort=email&amp;order=<?php echo ($sort == 'email' AND $order == 'asc') ? 'desc' : 'asc' ?>">E-mail</a></td>
				<td><a href="?sort=name&amp;order=<?php echo ($sort == 'name' AND $order == 'asc') ? 'desc' : 'asc' ?>">Imię i nazwisko</a></td>
				<td><a href="?sort=flaw&amp;order=<?php echo ($sort == 'flaw' AND $order == 'asc') ? 'desc' : 'asc' ?>">Wada</a></td>
				<td><a href="?sort=value&amp;order=<?php echo ($sort == 'value' AND $order == 'asc') ? 'desc' : 'asc' ?>">Wartość</a></td>
				<td>Opcje</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($results as $row): ?>
			<tr>
				<td><?php echo $row['email'] ?></td>
				<td><?php echo empty($row['name']) ? '<i>Brak</i>' : $row['name'] ?></td>
				<td><?php echo flaw_name($row['flaw']) ?></td>
				<td><?php echo $row['value'] ?></td>
				<td>
					<a href="?<?php echo empty($_GET) ? NULL : http_build_query($_GET).'&amp;' ?>delete=<?php echo $row['id'] ?>" onclick="return confirm('Czy jesteś tego pewien?')">Usuń</a>
				</td>
			</tr>
			<?php endforeach ?>
		</tbody>
	</table>
	<?php endif ?>
</div>