;NSIS Modern User Interface
;Installer builder for Pokemon Showdown

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

;--------------------------------
;General

# MUI Symbol Definitions
!define MUI_ICON "icons\pokemonshowdown.ico"

!define APPNAME "Pokemon Showdown"
!define COMPANYNAME "Pokemon Showdown"
!define ABOUTURL "http://pokemonshowdown.com/" # "Publisher" link
!define INSTALLSIZE 48000

  ;Name and file
  Name "Pokemon Showdown"
  OutFile "setup.exe"

  ;Default installation folder
  InstallDir "$PROGRAMFILES\Pokemon Showdown"
CRCCheck on
XPStyle on
ShowInstDetails show
  
  ;Get installation folder from registry if available
  InstallDirRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "InstallLocation"

  ;Request application privileges for Windows Vista
#  RequestExecutionLevel user
RequestExecutionLevel admin

;--------------------------------
;Interface Settings

  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_BITMAP "icons\installerbg.bmp" ; optional
  !define MUI_ABORTWARNING

;--------------------------------
;Pages

#  !insertmacro MUI_PAGE_COMPONENTS
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_NOAUTOCLOSE
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Play Pokemon Showdown"
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchLink"

  !insertmacro MUI_PAGE_FINISH

  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  
;--------------------------------
;Languages
 
  !insertmacro MUI_LANGUAGE "English"

;--------------------------------
;Installer Sections

Section "Main" SecMain

	setOutPath $INSTDIR
	# Files added here should be removed by the uninstaller (see section "uninstall")
	file "pokemonshowdown.exe"
	file "package.json"
	file "index.html"
	file "nw.pak"
	file "libEGL.dll"
	file "libGLESv2.dll"
	file "ffmpegsumo.dll"
	file "icudt.dll"
	CreateDirectory "$INSTDIR\icons"
	setOutPath "$INSTDIR\icons"
	file "icons\icon_32x32.png"
	file "icons\pokemonshowdown.ico"

	writeUninstaller "$INSTDIR\uninstall.exe"

	createShortCut "$SMPROGRAMS\${APPNAME}.lnk" "$INSTDIR\pokemonshowdown.exe" "" "$INSTDIR\icons\pokemonshowdown.ico"

	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "QuietUninstallString" "$\"$INSTDIR\uninstall.exe$\" /S"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "InstallLocation" "$\"$INSTDIR$\""
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayIcon" "$\"$INSTDIR\icons\pokemonshowdown.ico$\""
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "$\"${COMPANYNAME}$\""
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLInfoAbout" "$\"${ABOUTURL}$\""
	# There is no option for modifying or repairing the install
	WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoModify" 1
	WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoRepair" 1
	# Set the INSTALLSIZE constant (!defined at the top of this script) so Add/Remove Programs can accurately report the size
	WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "EstimatedSize" ${INSTALLSIZE}

SectionEnd

;--------------------------------
;Descriptions

  ;Language strings
#  LangString DESC_SecMain ${LANG_ENGLISH} "A test section."

  ;Assign language strings to sections
#  !insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
#    !insertmacro MUI_DESCRIPTION_TEXT ${SecDummy} $(DESC_SecDummy)
#  !insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------
;Uninstaller Section

Section "Uninstall"

	# Remove Start Menu launcher
	delete "$SMPROGRAMS\${APPNAME}.lnk"
 
	# Remove files
	delete "$INSTDIR\pokemonshowdown.exe"
	delete "$INSTDIR\package.json"
	delete "$INSTDIR\index.html"
	delete "$INSTDIR\nw.pak"
	delete "$INSTDIR\libEGL.dll"
	delete "$INSTDIR\libGLESv2.dll"
	delete "$INSTDIR\ffmpegsumo.dll"
	delete "$INSTDIR\icudt.dll"
	delete "$INSTDIR\icons\icon_32x32.png"
	delete "$INSTDIR\icons\pokemonshowdown.ico"
	delete "$INSTDIR\data\icon_32x32.png"
	delete "$INSTDIR\data\pokemonshowdown.ico"
	rmDir "$INSTDIR\icons"
	rmDir "$INSTDIR\data"

	# Always delete uninstaller as the last action
	delete $INSTDIR\uninstall.exe
 
	# Try to remove the install directory - this will only happen if it is empty
	rmDir $INSTDIR
 
	# Remove uninstaller information from the registry
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"

SectionEnd

Function LaunchLink
  ExecShell "" "$INSTDIR\pokemonshowdown.exe"
FunctionEnd
