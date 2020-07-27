<?php

error_reporting(0);

include '../style/wrapper.inc.php';

$page = 'june2013attack';
$pageTitle = "June 2013 attack";

includeHeader();

?>
<div class="main" style="max-width:8in;">

<h1>June 2013 attack on Pokémon Showdown</h1>

<div style="margin-left: 30px; font-style: italic;">
Published June 20, 2013.
</div>

<p>Yesterday, an attacker compromised Pokémon Showdown in order to acquire user passwords. He may have obtained up to 160,000 passwords in total (out of a total of 302,000 users).</p>

<p>You should immediately change your Pokémon Showdown password and, more importantly, you should change this password everywhere else it was used, such as your email account. If you don't change your passwords, the attacker may compromise your other accounts. If you've logged into Pokémon Showdown since May, your passwords are probably safe &mdash; but not necessarily &mdash; and you should change them anyway as a precaution.</p>

<p>We have taken steps, described below, to prevent an attack like this from happening again.</p>

<p>The remainder of this document is a detailed description of the attack. It's not necessary to read any further unless you are interested in the technical details of the attack and what we have done to prevent it from happening again. There is also some important information for server operators near the bottom.</p>

<h2>A note on how passwords are stored</h2>

<p>Before getting into the details of the attack, it is important to understand how websites store your passwords. Passwords are not stored in plaintext. Instead, they are run through a <a target="_blank" href="https://en.wikipedia.org/wiki/Hashing_function">hashing function</a>, which produces a new value (the "hash"). The key property of a hashing function is that it is difficult to find any value that hashes to a known target value, i.e., the function is 1-way.</p>

<p>The idea of using a hashing function is that if the password store is compromised, the attacker will not get users' passwords; instead he will only get hashes, which cannot be used to obtain passwords easily.</p>

<p>In years past, it was common to use several rounds of a basic hashing function such as MD5 or SHA-1 to hash passwords. However, modern hardware (and in particular, graphics cards) can compute billions of these functions per second, and thereby retrieve the password using brute force. As a result, MD5 and SHA-1 are not adequate for storing passwords in 2013.</p>

<p>Prior to April 25, 2013, Pokémon Showdown stored passwords using several rounds of MD5 (including a salt, which is a series of random characters included in the hash function in order to prevent use of a pre-computed MD5 inverse table, commonly known as a "rainbow table"). On April 25, 2013, we improved the security of password storage to instead use <a target="_blank" href="https://en.wikipedia.org/wiki/Bcrypt">bcrypt</a>, which is very expensive to reverse using contemporary hardware in general (however, if a person has a very weak password, such as a dictionary word or their username, it would still be easy to reverse despite the use of bcrypt).</p>

<p>It is not possible to convert people's passwords into a new hashing format until the next time they log in and enter their password, because changing hashing formats requires having the user's password.</p>

<p>As a result, anybody who logged into Pokémon Showdown after April 25, 2013 had their password re-hashed into the new secure format; however, people who have not logged into Pokémon Showdown since before April 25 have their passwords stored in the insecure format.</p>

<p>If an attacker were able to view the Pokémon Showdown database (and had no greater access), he would only be able to get the passwords of users whose passwords continued to be stored in the old format (and weak passwords stored in the new format). He would not be able to get the passwords of most users who have logged in since April 25, 2013, since those passwords are stored in a more secure format. However, using other kinds of attacks it would still be possible to obtain some other passwords.</p>

<h2>Details of the attack</h2>

<p>In this section, we will describe the specific attack perpetrated against Pokémon Showdown.</p>

<p>On the morning of June 19, 2013, an attacker compromised the Filecharger website, which is a different website, unrelated to Pokémon Showdown, which is owned by Zarel, the creator of Pokémon Showdown. Filecharger was written many years ago, and likely contained one or more vulnerabilities. Compromising Filecharger allowed the attacker to obtain Filecharger's user database, which contained passwords hashed using MD5, which as you now know, is insecure. Unfortunately, Zarel used the same password for Filecharger as he did on Pokémon Showdown.</p>

<p>Immediately after compromising Filecharger, at around 9:37 AM CDT on June 19, 2013, the attacker set his sights on Pokémon Showdown.</p>

<p>The attacker started by using an <a target="_blank" href="https://github.com/Zarel/Pokemon-Showdown-Client/commit/5fe36c3090ff9fb9149fb4819985499dd9516990">SQL injection vulnerability</a> in the ladder code to retrieve Pokémon Showdown passwords. This vulnerability, which we have now fixed, allowed <i>viewing</i> the database, but did not allow modifying it. As a result, the attacker would not have been able to obtain the password of any users who logged in since April 25, 2013 using this method alone, unless their passwords were notably weak. (However, many of those users may have had alts which had not logged in recently, and the attacker could obtain the alts' passwords, which might be the same as the main nick's passwords.)</p>

<p>At 12:06 PM CDT, the attacker successfully logged into Zarel's Pokémon Showdown account. He may have used Zarel's password obtained from Filecharger, or he may have reversed the password hash of one of Zarel's alts on Pokémon Showdown (which had not been used in months and so had insecure passwords). In any case, the attacker did not appear to make use of any software exploit to log in as Zarel, other than knowing Zarel's password.</p>

<p>After logging in as Zarel, the attacker accessed the admincp on the Pokémon Showdown forums and enabled a feature of phpBB3 that allows execution of PHP code in templates. The attacker then modified the FAQ template to insert a backdoor. He then used that backdoor to upload a PHP <a target="_blank" href="https://en.wikipedia.org/wiki/Shell_%28computing%29">shell</a> to the server. A shell is a tool for navigating the computer, kind of like the file manager on Windows, but more powerful. Using his shell, the attacker backed up a number of Pokémon Showdown config files for his own uses, and then modified our login code to log users' plaintext passwords to a log file (<code>/tmp/log.txt</code>).</p>

<p>As a result, any users who entered their passwords to log in between 12:37 PM CDT on June 19, 2013 and about 10 AM CDT on June 20, 2013 had their password written to a log file. It is not known how much of this log file the attacker actually saved, but as a precaution, we consider all of these passwords to be potentially compromised.</p>

<h2>Post-mortem</h2>

<p>Since discovering the attack, we have <a target="_blank" href="https://github.com/Zarel/Pokemon-Showdown-Client/commit/5fe36c3090ff9fb9149fb4819985499dd9516990">fixed</a> the SQL injection vulnerability used by the attacker, and Zarel has changed his password. Everybody else is being urged to change their passwords as well.</p>

<p>Pokémon Showdown does not collect email addresses, so we cannot warn users by email. However, we will attempt to disseminate this information as widely as we can in order to protect users to the fullest extent possible.</p>

<p>In addition, it should be noted that the attacker has access to login server private keys 0 and 1, which allows logging in as any user on servers that use those keys. As a result, we have introduced <a target="_blank" href="https://github.com/Zarel/Pokemon-Showdown/commit/1e7c65aadee011ffb247d528044af5d621503da3">private key 2</a>, which the attacker does not have. This new key is already live on the main server; third-party servers should update <i>immediately</i> by copying the new config values into their <code>config.js</code> file.</p>

<p>Specifically, third-party server operators should locate <code>exports.loginserverpublickeyid</code> and <code>exports.loginserverpublickey</code> in their <code>config.js</code> file and replace them by the following new values:</p>

<blockquote>
<pre>
exports.loginserverpublickeyid = 2;
exports.loginserverpublickey = "-----BEGIN RSA PUBLIC KEY-----\n" +
	"MIICCgKCAgEAtFldA2rTCsPgqsp1odoH9vwhf5+QGIlOJO7STyY73W2+io33cV7t\n" +
	"ReNuzs75YBkZ3pWoDn2be0eb2UqO8dM3xN419FdHNORQ897K9ogoeSbLNQwyA7XB\n" +
	"N/wpAg9NpNu00wce2zi3/+4M/2H+9vlv2/POOj1epi6cD5hjVnAuKsuoGaDcByg2\n" +
	"EOullPh/00TkEkcyYtaBknZpED0lt/4ekw16mjHKcbo9uFiw+tu5vv7DXOkfciW+\n" +
	"9ApyYbNksC/TbDIvJ2RjzR9G33CPE+8J+XbS7U1jPvdFragCenz+B3AiGcPZwT66\n" +
	"dvHAOYRus/w5ELswOVX/HvHUb/GRrh4blXWUDn4KpjqtlwqY4H2oa+h9tEENCk8T\n" +
	"BWmv3gzGBM5QcehNsyEi9+1RUAmknqJW0QOC+kifbjbo/qtlzzlSvtbr4MwghCFe\n" +
	"1EfezeNAtqwvICznq8ebsGETyPSqI7fSbpmVULkKbebSDw6kqDnQso3iLjSX9K9C\n" +
	"0rwxwalCs/YzgX9Eq4jdx6yAHd7FNGEx4iu8qM78c7GKCisygZxF8kd0B7V7a5UO\n" +
	"wdlWIlTxJ2dfCnnJBFEt/wDsL54q8KmGbzOTvRq5uz/tMvs6ycgLVgA9r1xmVU+1\n" +
	"6lMr2wdSzyG7l3X3q1XyQ/CT5IP4unFs5HKpG31skxlfXv5a7KW5AfsCAwEAAQ==\n" +
	"-----END RSA PUBLIC KEY-----\n";
</pre>
</blockquote>

<p>As a precaution, we are disabling the old login server keys very soon. Third-party server operators must update their <code>config.js</code> file and then restart their servers, or logging in will no longer work on those servers.</p>

<p>Thanks for playing on Pokémon Showdown!</p>

</div>
<?php

includeFooter();

?>
