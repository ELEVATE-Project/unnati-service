Pull the code only from master branch or develop.
create a virtual environment in python. python3 -m venv path/to/virtualEnv
Once the virtual environment is created, activate the virtual environment. In Linux source { relative path to virtualEnv}/bin/activate In Windows { relative path to virtualEnv}/Scripts/activate
Install all the dependencies using requirement.txt using following command.  pip3 install -r requirement.txt
Make sure there are no errors in the install.
If there are any errors in the install, try to install the same version of the libraries seperatly.
Download the user given template for both projectTemplate.xlsx and project.xlsx and save it in the same file where the code is hosted.
There are TWO Command to run the script as.  
    i. python3 main.py --env dev --programFile projectTemplate.xlsx  - For projectTemplate
    ii.python3 main.py --env dev --projectFile project.xlsx  -  For project
We have dev and local as environment.