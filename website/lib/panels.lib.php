<?php

include_once dirname(__FILE__).'/../theme/wrapper.inc.php';

class Panels {
	var $output = 'normal';
	var $tab = false;

	var $root;
	var $name;

	function Panels() {
		global $psconfig;

		if (@$psconfig['root']) $this->root = $psconfig['root'];
		if (@$psconfig['name']) $this->name = $psconfig['name'];

		switch (@$_REQUEST['output']) {
			case 'html':
			case 'json':
				$this->output = $_REQUEST['output'];
				break;
		}
	}

	var $pagetitle = false;
	function setPageTitle($title) {
		if ($this->pagetitle === false) {
			$this->pagetitle = $title;
		}
	}

	var $pagedescription = false;
	function setPageDescription($description) {
		if ($this->pagedescription === false) {
			$this->pagedescription = $description;
		}
	}

	function setTab($tab) {
		if ($this->tab === false) {
			$this->tab = $tab;
		}
	}

	var $depth = 0;
	var $scriptsIncluded = false;
	function start() {
		$this->depth++;
		if ($this->depth != 1) {
			return;
		}
		if ($this->output === 'normal') {
			ThemeHeaderTemplate();
		}
	}
	function scripts() {
		if ($this->output !== 'normal') return;
		if ($this->scriptsIncluded) return;
		$this->scriptsIncluded = true;
		ThemeScriptsTemplate();
	}
	function end() {
		$this->depth--;
		if ($this->depth != 0) {
			return;
		}
		if ($this->output === 'normal') {
			ThemeFooterTemplate();
		}
	}
}

$panels = new Panels();
