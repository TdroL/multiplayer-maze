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
	
	body {
		margin: 5% auto;
		width: 400px;
	}
	
	label {
		display: block;
		margin-bottom: 0.5em;
	}
	label span {
		display: block;
	}
	
	input[type=text] {
		padding: 2px;
		width: 300px;
		font-size: 1em;
		background-color: #fff;
		border: 1px solid #666;
		-webkit-border-radius: 3px;
		   -moz-border-radius: 3px;
		        border-radius: 3px;
		
	}
	
	input[type=text]:focus {
		-webkit-box-shadow: 0 0 8px #ff9933;
		   -moz-box-shadow: 0 0 8px #ff9933;
		        box-shadow: 0 0 8px #ff9933;
	}
	
	input[type=submit] {
		padding: 2px;
		font-size: 1em;
	}
	
	.error {
		background-color: #fff;
		border: 1px solid #f00;
		-webkit-border-radius: 5px;
		   -moz-border-radius: 5px;
		        border-radius: 5px;
		-webkit-box-shadow: 0 0 8px #ff3333;
		   -moz-box-shadow: 0 0 8px #ff3333;
		        box-shadow: 0 0 8px #ff3333;
		color: #f00;
		font-weight: bold;
		padding: 5px;
		display: inline-block;
		margin-bottom: 0.5em;
	}
	
	.success {
		border: 1px solid blue;
		-webkit-border-radius: 5px;
		   -moz-border-radius: 5px;
		        border-radius: 5px;
		color: blue;
		font-weight: bold;
		padding: 5px;
		display: inline-block;
		margin-bottom: 0.5em;
	}
	
</style>
<?php

$db = new PDO('mysql:host=localhost;dbname=maze', 'root', '');

$exists = $invalid = $send = FALSE;
$email = $name = NULL;

if ($_POST)
{
	$seed = $_POST['__SEED__'];
	$email = $_POST['email'];
	$name = empty($_POST['name']) ? NULL : $_POST['name'];
		
	if (isset($_SESSION[$seed]))
	{
		// nothing
	}
	elseif (empty($_POST['email']) OR ! filter_var($_POST['email'], FILTER_VALIDATE_EMAIL))
	{
		$invalid = TRUE;
	}
	else
	{
		$_SESSION[$seed] = TRUE;
		
		$email = $_POST['email'];
		$name = isset($_POST['name']) ? $_POST['name']: NULL;
		$flaw = isset($_GET['flaw']) ? $_GET['flaw'] : NULL;
		$value = isset($_GET['value']) ? intval($_GET['value']) : 0;
		
		if (in_array($flaw, array('prot', 'deut', 'trit', 'myopia')))
		{
			$query = $db->prepare('SELECT id FROM results WHERE email=:email');
			$query->bindValue(':email', $email, PDO::PARAM_STR);
			$query->execute();
			
			if (count($query->fetchAll()))
			{
				$exists = TRUE;
			}
			else
			{
				$query = $db->prepare('INSERT INTO results (email, name, flaw, value) VALUES(:email, :name, :flaw, :value)');
				$query->bindValue(':email', $email, PDO::PARAM_STR);
				$query->bindValue(':name', $name, PDO::PARAM_STR);
				$query->bindValue(':flaw', $flaw, PDO::PARAM_STR);
				$query->bindValue(':value', $value, PDO::PARAM_INT);
				$query->execute();
				
				$email = $name = NULL;
				
				$send = TRUE;
			}
		}
	}
}

?>
<div id="container">
	<h1>Formularz</h1>
	<form action="form.php?<?php echo http_build_query($_GET) ?>" method="post">
		<div>
			<input type="hidden" name="__SEED__" value="<?php echo md5(microtime()) ?>" />
			<?php if($exists): ?>
			<p class="error">Taki adres e-mail już istnieje w bazie danych.</p>
			<?php endif ?>
			<?php if($invalid): ?>
			<p class="error">Nieprawidłowy adres e-mail.</p>
			<?php endif ?>
			<?php if($send): ?>
			<p class="success">Dziękujemy za wpis.</p>
			<?php endif ?>
			<p>
				<label><span>Podaj swój adres e-mail:</span> <input type="text" name="email" value="<?php echo $email ?>" placeholder="adres@example.org" /></label>
			</p>
			<p>
				<label><span>Podaj swoje imię i nazwisko (opcjonalne):</span> <input type="text" name="name" value="<?php echo $name ?>" placeholder="Imię Nazwisko" /></label>
			</p>
			<p><input type="submit" value="Dodaj" /></p>
		</div>
	</form>
</div>