# Python scripts for elevate-project implementation

Python script to upload a program and add multiple resources like Projects , Surveys , Observations (with and without rubrics) to it and also upload project add multiple resources like task.

### Resource templates
- [Programs](https://docs.google.com/spreadsheets/d/1Q4z1d1aUHY5VVrco2TvHPuWEq7314glUjFxB-jYjfiY/edit?usp=share_link)
- [Projects](https://docs.google.com/spreadsheets/d/1YnWTcHrmvDYVedGktKr2V25G7qBNUmYjwk1huHwGwNc/edit?usp=share_link)


- Pull the code from latest release branch
- To clone the repository 
``` git clone -b latestBranch <git-link>```
- Navigate to Project-Service-implementation-Script folder 
``` PROJECT-SERVICE/Project-Service-implementation-Script/main.py```
- create a virtual environment in python.
``` python3 -m venv path/to/virtualEnv ```
- Once the virtual environment is created, activate the virtual environment.
In Linux
``` source { relative path to virtualEnv}/bin/activate ```
In Windows
``` { relative path to virtualEnv}/Scripts/activate ```
- Install all the dependencies using requirement.txt using following command. 
```  pip3 install -r requirement.txt ```
- Make sure there are no errors in the install.
- If there are any errors in the install, try to install the same version of the libraries seperatly.
- Download the user given template and save it in the same file where the code is hosted.
- There are TWO Command to run the script.
i. For projectTemplate : 
```  python3 main.py --env pre-prod --programFile input.xlsx ```
ii. For projectTemplate :
```  python3 main.py --env pre-prod --project input.xlsx ```
We have ``` dev ``` and ``` local ``` as environment.
