# Server
A Flask based server for the tree-seg project

## Dependencies
Requires following python packages to be installed:  
1. virtualenv
## Cloning Repository
**Linux/Mac**
```console
foo@bar:~$ git clone <current repo link>
foo@bar:~$ git checkout server
```

## Installation
**Linux/Mac**
```console
foo@bar:~$ chmod +x install.bash
foo@bar:~$ ./install.bash
```

## Running Server
**Linux/Mac**
```console
foo@bar:~$ source ENV/bin/activate
(ENV) foo@bar:~$ gunicorn --bind 0.0.0.0:5000 wsgi:app
```

## Updating Requirements
**Linux/Mac**
```console
foo@bar:~$ source ENV/bin/activate
(ENV) foo@bar:~$ pip install <new-requirement>
(ENV) foo@bar:~$ pip freeze > requirements.txt
```

## Stopping Server
**Linux/Mac**  
Use ```Ctrl+C``` followed by:
```console
(ENV) foo@bar:~$ deactivate
```

## Notes
1. Always use ```Ctrl + C``` and not ```Ctrl + X```
2. Always commit only after updating requirements