Hello World
===========

This example will give you an example of a very basic project. It will show you how to run all parts of the ActiveStack and you’ll be able to watch ActiveStack synchronize your javascript clients as you add, remove and change the colors of some blocks.

## Installation

### 0. Prerequisites

  * Node >= 0.10
  * Java SDK >= 1.5
  * MySQL >= 5.0
  * Redis >= 2.4
  * RabbitMQ v2.8

### 1. Clone the project repository 

```bash
> git clone git@github.com/ActiveStack/HelloWorld.git
```

### 2. Init and install submodules

```bash
> cd HelloWorld
> git submodule init
> git submodule update
```

## Start it!

### 0. Start Prereqs

Depending on how you have MySQL, Redis and RabbitMQ servers installed you might do this differently but here is a good faith best guess:

```bash
# New term window
> mysqld
# New term window
> redis-server
# New term window
> rabbitmq-server
```

### 1. Start the Gateway Server

```bash
> cd gateway
> npm install
> node src/server.js resources/no_ssl.properties
```

### 2. Start the Worker process

In another bash window/tab
```bash
> cd helloworld/worker
> mvn package
> java -jar target/helloworld_worker-0.0.1.one-jar.jar
```

### 3. Start the Client Web Server

In yet another bash window/tab
```bash
> cd helloworld/client
> http-server 8081
```

## Use it!

  * Open up two different browsers to http://localhost:8081 and login with a google account
  * Add blocks, remove blocks and change the block color by clicking on them. 
  * Cool how it syncs up in real time right!?