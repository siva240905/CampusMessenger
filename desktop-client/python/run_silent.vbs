Set WshShell = CreateObject("WScript.Shell")
strPath = WScript.ScriptFullName
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objFile = objFSO.GetFile(strPath)
strFolder = objFSO.GetParentFolderName(objFile)

WshShell.CurrentDirectory = strFolder

' Check if pythonw exists or fallback to python
Dim pythonExe
pythonExe = "pythonw.exe"

strCmd = pythonExe & " """ & strFolder & "\run_client.py"" --silent"
WshShell.Run strCmd, 0, False
