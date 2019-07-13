## DOODAH WEB SERVICE
## VERSION 0.0.1
## (c) Copyright Si Dunford, July 2019
##
import paho.mqtt.client as paho_mqtt
import os
import json
import configparser

# RESTFUL.py
# REST API

#https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world
#https://blog.miguelgrinberg.com/post/designing-a-restful-api-with-python-and-flask

# EXAMPLE SOURCE
# https://gist.github.com/miguelgrinberg/5614326

# Authentication / Security
# https://pythonspot.com/login-authentication-with-flask/
# https://blog.miguelgrinberg.com/post/restful-authentication-with-flask

# Method definitions (RFC2616/7231): GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE

# GET /api/items		Obtain list of items
# GET /api/items/123	Obtain data about an item
# POST /api/items		Create a new item
# PUT /api/items/123	Update an item
# DELETE /api/items/123	Delete an item

#!flask/bin/python
from flask import Flask, jsonify, abort
from flask import request, make_response, url_for
from flask import render_template
##from flask_httpauth import HTTPBasicAuth
from pathlib import Path


app = Flask(__name__, static_folder='web')
##auth = HTTPBasicAuth()
home = str(Path.home())

## Serve the default skin
@app.route('/')
def root(): 
    #return app.send_static_file('web/doodah.html?')
    return serve_layout( 'Default' )

## Serve favicon
@app.route('/favicon.ico')
def favicon(): 
    return app.send_static_file('favicon.ico')
    ##return serve_page( filename )

## Serve Doodah Javascript
@app.route('/js/<path:path>')
def js(path):
    return app.send_static_file(path)
    ##return app.send_from_directory('js', path)
    ##send_static_file("js/"+path+)

## Serve Doodah Stylesheets
@app.route('/css/<path:path>')
def css(path):
    return app.send_static_file(path)

## Serve optional skins (THIS MUST BE LAST ROUTE)
## Catches all other submissions
@app.route('/<path:filename>')
def specific(filename): 
    return serve_layout( filename )

## ** Serve static pages **
##@app.route('<path:filename>')
##def sendfile(path):
##    return app.send_static_file('index.html')


##@auth.get_password
def get_password(username):
    if username == 'miguel':
        return 'python'
    return None

##@auth.error_handler
def unauthorized():
    return make_response(jsonify( { 'error': 'Unauthorized access' } ), 403)
    # return 403 instead of 401 to prevent browsers from displaying the default auth dialog
    
##@app.errorhandler(400)
##def not_found(error):
##    return make_response(jsonify( { 'error': 'Bad request' } ), 400)

##@app.errorhandler(404)
##def not_found(error):
##    return make_response(jsonify( { 'error': 'Not found' } ), 404)

## Serves an individual layout
def serve_layout( name ):
    filepath = Path( home+"/doodah/"+name+".ini" )
    print( "SERVING LAYOUT:", filepath )
    if not filepath.is_file():
        abort(404)
    skins = { 
        'title':"name",
        'skins':{'skins':"var thisisatest=1;" }
    }
    layout = configparser.ConfigParser()
    
    ## Open Layout file
    layout.read(filepath)
    
    ## Parse all sections, importing the skins
    for section in layout.sections():
        ## Standardise the path separator
        section = section.replace("\\","/")
        ## Open skin
        print("")
        print("["+section+"]")
        print(os.path.split(section))
        print(os.path.basename(section))
        print(section.split("/"))
        skin_path=os.path.split(section)
        if skin_path[0]==os.path.basename(section):
            skin_folder=skin_path[0]
            skin_file=skin_path[0]
        else:
            skin_folder=skin_path[0]+"/"+skin_path[1]
            skin_file=skin_path[1]
        print( ".Path:"+skin_folder)
        print( ".File:"+skin_file)
        skin = Path( home+"/doodah/"+skin_folder+"/"+skin_file+".ini" )
        print( ".location:"+str(skin))
        if not skin.is_file():
            print( "ERROR:",skin,"is not found" )
        else:
            config = configparser.ConfigParser()
            config.read( skin )
        
    return render_template('doodah.html', title=name, preload=json.dumps(skins))
    ## dict = json.loads(input)
    
## Serve Skin Resources **
@app.route('/inc/<path:skin>/<filename>')
def serve_resource(skin,filename):
    echo( "Resource requested: " + skin + "," + filename )
    path = Path( home+"/doodah/"+skin )
    try:
        return send_from_directory(path, filename)
    except FileNotFoundError:
        abort(404)
        
"""    
tasks = [
    {
        'id': 1,
        'title': u'Buy groceries',
        'description': u'Milk, Cheese, Pizza, Fruit, Tylenol', 
        'done': False
    },
    {
        'id': 2,
        'title': u'Learn Python',
        'description': u'Need to find a good Python tutorial on the web', 
        'done': False
    }
]

## REPLACE ID WITH URI USED TO ACCESS A TASK
def make_public_task(task):
    new_task = {}
    for field in task:
        if field == 'id':
            new_task['uri'] = url_for('get_task', task_id = task['id'], _external = True)
        else:
            new_task[field] = task[field]
    return new_task

@app.route('/todo/api/v1.0/tasks', methods = ['GET'])
##@auth.login_required
def get_tasks():
    return jsonify( { 'tasks': map(make_public_task, tasks) } )

@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['GET'])
@auth.login_required
def get_task(task_id):
    task = filter(lambda t: t['id'] == task_id, tasks)
    if len(task) == 0:
        abort(404)
    return jsonify( { 'task': make_public_task(task[0]) } )

@app.route('/todo/api/v1.0/tasks', methods = ['POST'])
@auth.login_required
def create_task():
    if not request.json or not 'title' in request.json:
        abort(400)
    task = {
        'id': tasks[-1]['id'] + 1,
        'title': request.json['title'],
        'description': request.json.get('description', ""),
        'done': False
    }
    tasks.append(task)
    return jsonify( { 'task': make_public_task(task) } ), 201

@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['PUT'])
@auth.login_required
def update_task(task_id):
    task = filter(lambda t: t['id'] == task_id, tasks)
    if len(task) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'title' in request.json and type(request.json['title']) != unicode:
        abort(400)
    if 'description' in request.json and type(request.json['description']) is not unicode:
        abort(400)
    if 'done' in request.json and type(request.json['done']) is not bool:
        abort(400)
    task[0]['title'] = request.json.get('title', task[0]['title'])
    task[0]['description'] = request.json.get('description', task[0]['description'])
    task[0]['done'] = request.json.get('done', task[0]['done'])
    return jsonify( { 'task': make_public_task(task[0]) } )
    
@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['DELETE'])
@auth.login_required
def delete_task(task_id):
    task = filter(lambda t: t['id'] == task_id, tasks)
    if len(task) == 0:
        abort(404)
    tasks.remove(task[0])
    return jsonify( { 'result': True } )
"""

if __name__ == '__main__':
    app.run(debug = True)
	
