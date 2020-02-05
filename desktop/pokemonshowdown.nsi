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
	file "credits.html"
	file "d3dcompiler_47.dll"
	file "ffmpeg.dll"
	file "icudtl.dat"
	file "index.html"
	file "libEGL.dll"
	file "libGLESv2.dll"
	file "natives_blob.bin"
	file "node.dll"
	file "notification_helper.exe"
	file "nw.dll"
	file "pokemonshowdown.exe"
	file "nw_100_percent.pak"
	file "nw_200_percent.pak"
	file "nw_elf.dll"
	file "package.json"
	file "resources.pak"
	file "v8_context_snapshot.bin"
	CreateDirectory "$INSTDIR\icons"
	setOutPath "$INSTDIR\icons"
	file "icons\icon_32x32.png"
	file "icons\installerbg.bmp"
	file "icons\pokemonshowdown.ico"
	CreateDirectory "$INSTDIR\locales"
	setOutPath "$INSTDIR\locales"
	file "locales\am.pak"
	file "locales\am.pak.info"
	file "locales\ar.pak"
	file "locales\ar.pak.info"
	file "locales\bg.pak"
	file "locales\bg.pak.info"
	file "locales\bn.pak"
	file "locales\bn.pak.info"
	file "locales\ca.pak"
	file "locales\ca.pak.info"
	file "locales\cs.pak"
	file "locales\cs.pak.info"
	file "locales\da.pak"
	file "locales\da.pak.info"
	file "locales\de.pak"
	file "locales\de.pak.info"
	file "locales\el.pak"
	file "locales\el.pak.info"
	file "locales\en-GB.pak"
	file "locales\en-GB.pak.info"
	file "locales\en-US.pak"
	file "locales\en-US.pak.info"
	file "locales\es-419.pak"
	file "locales\es-419.pak.info"
	file "locales\es.pak"
	file "locales\es.pak.info"
	file "locales\et.pak"
	file "locales\et.pak.info"
	file "locales\fa.pak"
	file "locales\fa.pak.info"
	file "locales\fi.pak"
	file "locales\fi.pak.info"
	file "locales\fil.pak"
	file "locales\fil.pak.info"
	file "locales\fr.pak"
	file "locales\fr.pak.info"
	file "locales\gu.pak"
	file "locales\gu.pak.info"
	file "locales\he.pak"
	file "locales\he.pak.info"
	file "locales\hi.pak"
	file "locales\hi.pak.info"
	file "locales\hr.pak"
	file "locales\hr.pak.info"
	file "locales\hu.pak"
	file "locales\hu.pak.info"
	file "locales\id.pak"
	file "locales\id.pak.info"
	file "locales\it.pak"
	file "locales\it.pak.info"
	file "locales\ja.pak"
	file "locales\ja.pak.info"
	file "locales\kn.pak"
	file "locales\kn.pak.info"
	file "locales\ko.pak"
	file "locales\ko.pak.info"
	file "locales\lt.pak"
	file "locales\lt.pak.info"
	file "locales\lv.pak"
	file "locales\lv.pak.info"
	file "locales\ml.pak"
	file "locales\ml.pak.info"
	file "locales\mr.pak"
	file "locales\mr.pak.info"
	file "locales\ms.pak"
	file "locales\ms.pak.info"
	file "locales\nb.pak"
	file "locales\nb.pak.info"
	file "locales\nl.pak"
	file "locales\nl.pak.info"
	file "locales\pl.pak"
	file "locales\pl.pak.info"
	file "locales\pt-BR.pak"
	file "locales\pt-BR.pak.info"
	file "locales\pt-PT.pak"
	file "locales\pt-PT.pak.info"
	file "locales\ro.pak"
	file "locales\ro.pak.info"
	file "locales\ru.pak"
	file "locales\ru.pak.info"
	file "locales\sk.pak"
	file "locales\sk.pak.info"
	file "locales\sl.pak"
	file "locales\sl.pak.info"
	file "locales\sr.pak"
	file "locales\sr.pak.info"
	file "locales\sv.pak"
	file "locales\sv.pak.info"
	file "locales\sw.pak"
	file "locales\sw.pak.info"
	file "locales\ta.pak"
	file "locales\ta.pak.info"
	file "locales\te.pak"
	file "locales\te.pak.info"
	file "locales\th.pak"
	file "locales\th.pak.info"
	file "locales\tr.pak"
	file "locales\tr.pak.info"
	file "locales\uk.pak"
	file "locales\uk.pak.info"
	file "locales\vi.pak"
	file "locales\vi.pak.info"
	file "locales\zh-CN.pak"
	file "locales\zh-CN.pak.info"
	file "locales\zh-TW.pak"
	file "locales\zh-TW.pak.info"
	CreateDirectory "$INSTDIR\swiftshader"
	setOutPath "$INSTDIR\swiftshader"
	file "swiftshader\libEGL.dll"
	file "swiftshader\libGLESv2.dll"

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
	delete "$INSTDIR\swiftshader\libEGL.dll"
	delete "$INSTDIR\swiftshader\libGLESv2.dll"
	rmDir "$INSTDIR\swiftshader"
	delete "$INSTDIR\locales\am.pak"
	delete "$INSTDIR\locales\am.pak.info"
	delete "$INSTDIR\locales\ar.pak"
	delete "$INSTDIR\locales\ar.pak.info"
	delete "$INSTDIR\locales\bg.pak"
	delete "$INSTDIR\locales\bg.pak.info"
	delete "$INSTDIR\locales\bn.pak"
	delete "$INSTDIR\locales\bn.pak.info"
	delete "$INSTDIR\locales\ca.pak"
	delete "$INSTDIR\locales\ca.pak.info"
	delete "$INSTDIR\locales\cs.pak"
	delete "$INSTDIR\locales\cs.pak.info"
	delete "$INSTDIR\locales\da.pak"
	delete "$INSTDIR\locales\da.pak.info"
	delete "$INSTDIR\locales\de.pak"
	delete "$INSTDIR\locales\de.pak.info"
	delete "$INSTDIR\locales\el.pak"
	delete "$INSTDIR\locales\el.pak.info"
	delete "$INSTDIR\locales\en-GB.pak"
	delete "$INSTDIR\locales\en-GB.pak.info"
	delete "$INSTDIR\locales\en-US.pak"
	delete "$INSTDIR\locales\en-US.pak.info"
	delete "$INSTDIR\locales\es-419.pak"
	delete "$INSTDIR\locales\es-419.pak.info"
	delete "$INSTDIR\locales\es.pak"
	delete "$INSTDIR\locales\es.pak.info"
	delete "$INSTDIR\locales\et.pak"
	delete "$INSTDIR\locales\et.pak.info"
	delete "$INSTDIR\locales\fa.pak"
	delete "$INSTDIR\locales\fa.pak.info"
	delete "$INSTDIR\locales\fi.pak"
	delete "$INSTDIR\locales\fi.pak.info"
	delete "$INSTDIR\locales\fil.pak"
	delete "$INSTDIR\locales\fil.pak.info"
	delete "$INSTDIR\locales\fr.pak"
	delete "$INSTDIR\locales\fr.pak.info"
	delete "$INSTDIR\locales\gu.pak"
	delete "$INSTDIR\locales\gu.pak.info"
	delete "$INSTDIR\locales\he.pak"
	delete "$INSTDIR\locales\he.pak.info"
	delete "$INSTDIR\locales\hi.pak"
	delete "$INSTDIR\locales\hi.pak.info"
	delete "$INSTDIR\locales\hr.pak"
	delete "$INSTDIR\locales\hr.pak.info"
	delete "$INSTDIR\locales\hu.pak"
	delete "$INSTDIR\locales\hu.pak.info"
	delete "$INSTDIR\locales\id.pak"
	delete "$INSTDIR\locales\id.pak.info"
	delete "$INSTDIR\locales\it.pak"
	delete "$INSTDIR\locales\it.pak.info"
	delete "$INSTDIR\locales\ja.pak"
	delete "$INSTDIR\locales\ja.pak.info"
	delete "$INSTDIR\locales\kn.pak"
	delete "$INSTDIR\locales\kn.pak.info"
	delete "$INSTDIR\locales\ko.pak"
	delete "$INSTDIR\locales\ko.pak.info"
	delete "$INSTDIR\locales\lt.pak"
	delete "$INSTDIR\locales\lt.pak.info"
	delete "$INSTDIR\locales\lv.pak"
	delete "$INSTDIR\locales\lv.pak.info"
	delete "$INSTDIR\locales\ml.pak"
	delete "$INSTDIR\locales\ml.pak.info"
	delete "$INSTDIR\locales\mr.pak"
	delete "$INSTDIR\locales\mr.pak.info"
	delete "$INSTDIR\locales\ms.pak"
	delete "$INSTDIR\locales\ms.pak.info"
	delete "$INSTDIR\locales\nb.pak"
	delete "$INSTDIR\locales\nb.pak.info"
	delete "$INSTDIR\locales\nl.pak"
	delete "$INSTDIR\locales\nl.pak.info"
	delete "$INSTDIR\locales\pl.pak"
	delete "$INSTDIR\locales\pl.pak.info"
	delete "$INSTDIR\locales\pt-BR.pak"
	delete "$INSTDIR\locales\pt-BR.pak.info"
	delete "$INSTDIR\locales\pt-PT.pak"
	delete "$INSTDIR\locales\pt-PT.pak.info"
	delete "$INSTDIR\locales\ro.pak"
	delete "$INSTDIR\locales\ro.pak.info"
	delete "$INSTDIR\locales\ru.pak"
	delete "$INSTDIR\locales\ru.pak.info"
	delete "$INSTDIR\locales\sk.pak"
	delete "$INSTDIR\locales\sk.pak.info"
	delete "$INSTDIR\locales\sl.pak"
	delete "$INSTDIR\locales\sl.pak.info"
	delete "$INSTDIR\locales\sr.pak"
	delete "$INSTDIR\locales\sr.pak.info"
	delete "$INSTDIR\locales\sv.pak"
	delete "$INSTDIR\locales\sv.pak.info"
	delete "$INSTDIR\locales\sw.pak"
	delete "$INSTDIR\locales\sw.pak.info"
	delete "$INSTDIR\locales\ta.pak"
	delete "$INSTDIR\locales\ta.pak.info"
	delete "$INSTDIR\locales\te.pak"
	delete "$INSTDIR\locales\te.pak.info"
	delete "$INSTDIR\locales\th.pak"
	delete "$INSTDIR\locales\th.pak.info"
	delete "$INSTDIR\locales\tr.pak"
	delete "$INSTDIR\locales\tr.pak.info"
	delete "$INSTDIR\locales\uk.pak"
	delete "$INSTDIR\locales\uk.pak.info"
	delete "$INSTDIR\locales\vi.pak"
	delete "$INSTDIR\locales\vi.pak.info"
	delete "$INSTDIR\locales\zh-CN.pak"
	delete "$INSTDIR\locales\zh-CN.pak.info"
	delete "$INSTDIR\locales\zh-TW.pak"
	delete "$INSTDIR\locales\zh-TW.pak.info"
	rmDir "$INSTDIR\locales"
	delete "$INSTDIR\icons\icon_32x32.png"
	delete "$INSTDIR\icons\installerbg.bmp"
	delete "$INSTDIR\icons\pokemonshowdown.ico"
	rmDir "$INSTDIR\icons"
	delete "$INSTDIR\credits.html"
	delete "$INSTDIR\d3dcompiler_47.dll"
	delete "$INSTDIR\ffmpeg.dll"
	delete "$INSTDIR\icudtl.dat"
	delete "$INSTDIR\index.html"
	delete "$INSTDIR\libEGL.dll"
	delete "$INSTDIR\libGLESv2.dll"
	delete "$INSTDIR\natives_blob.bin"
	delete "$INSTDIR\node.dll"
	delete "$INSTDIR\notification_helper.exe"
	delete "$INSTDIR\nw.dll"
	delete "$INSTDIR\pokemonshowdown.exe"
	delete "$INSTDIR\nw_100_percent.pak"
	delete "$INSTDIR\nw_200_percent.pak"
	delete "$INSTDIR\nw_elf.dll"
	delete "$INSTDIR\package.json"
	delete "$INSTDIR\resources.pak"
	delete "$INSTDIR\v8_context_snapshot.bin"

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
