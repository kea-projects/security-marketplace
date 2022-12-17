#!/bin/bash
# This file has to executed from this directory: '.githook'

echo "[INFO]  Marking the scirpts as executable..."
echo ""
# Mark the scripts as excutable
chmod +x pre-commit
chmod_result=$?
if [ $chmod_result -ne 0 ]; then
    echo "[ERROR] Failed to mark the script: 'pre-commit; as executable!"
    echo "        Perhaps try to make it executable manually?"
    echo "        the command is: 'chmod +x <script-name>"
    exit $chmod_result
else
    echo "[INFO]  pre-commit script succesfully marked as executable. "
fi


chmod +x pre-push
chmod_result=$?
if [ $chmod_result -ne 0 ]; then
    echo "[ERROR] Failed to mark the script: 'pre-push' as executable!"
    echo "        Perhaps try to make it executable manually?"
    echo "        the command is: 'chmod +x <script-name>"
    exit $chmod_result
else
    echo "[INFO]  pre-push script succesfully marked as executable."
fi

echo ""

echo "[INFO]  Copying pre-commit script to $CWD/.git/hooks/pre-commit"
# Copy them where they need to be
cp -f ./pre-commit ../.git/hooks/pre-commit
copy_result=$?

if [ $copy_result -ne 0 ]; then
    echo "[ERROR] Failed to copy pre-commit! perhaps try to do it manually?"
    exit $copy_result
else
    echo "[INFO]  pre-commit script copied succesfull. "
fi


echo "[INFO]  Copying pre-push script to $CWD/.git/hooks/pre-push"
cp -f ./pre-push ../.git/hooks/pre-push
copy_result=$?

if [ $copy_result -ne 0 ]; then
    echo "[ERROR] Failed to copy pre-push script! perhaps try to do it manually?"
    exit $copy_result
else
    echo "[INFO]  pre-push script copied succesfull. "
fi

echo ""

echo "[INFO]  All files moved succesfully, all done!"
