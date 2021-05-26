# Node-RED Arrowhead framework nodes

A collection of nodes for [Node-RED](http://nodered.org) related to [Arrowhead Framework](https://www.arrowhead.eu/arrowheadframework).

## 1. Nodes and explaination

There are several nodes in this repository in order to connect with ```Arrowhead Framework```:

### 1.1 Regular nodes

This are nodes that can be drag & dropped to flows.

#### 1.1.1 AH Service Endpoint

This node is used to register a service (e.g. REST endpoint) to an ```Arrowhead Registry```.

| | |
|---|---|
| ![Arrowhead Service Registration](./screenshots/01_ah_service_registration.png)  | ![Arrowhead Service Registration node configuration.](./screenshots/02_ah_service_registration_config.png)  |
| *Arrowhead Service Registration node* | *Arrowhead Service Registration node configuration.* |

#### 1.1.2 AH Service Discovery

This node asks ```Arrowhead Orchestrator``` for an ```Arrowhead Service```.

| | |
|---|---|
| ![Arrowhead Service Discoverer node](./screenshots/05_ah_service_discoverer.png) | ![Arrowhead Service Dicoverer node configuration.](./screenshots/06_ah_service_discoverer_config.png) |
| *Arrowhead Service Discoverer node* | *Arrowhead Service Discoverer node configuration.*  |

### 1.2 Configuration nodes

This are configuration nodes that can be reused.

#### 1.2.1 AH Authentication Info.

Use to stablish authentication information for arrowhead systems. This will authenticate the provider/consumer systems.

| |
|---|
| ![Arrowhead Authentication Info. configuration node.](./screenshots/ah_authinfo_config.png) |
|*Arrowhead Authentication Info. configuration node.* |


#### 1.2.2 AH Orchestrator

Used to stablish where the ```Arrowhead Orchestrator``` can be found.

| |
|---|
| ![Arrowhead Orchestrator configuration node.](./screenshots/07_ah_orchestrator_config.png) |
|*Arrowhead Orchestrator configuration node.* |

#### 1.2.3 AH registry

Used to stablish where the ```Arrowhead Registry``` can be found.

| |
|---|
| ![Arrowhead Registry configuration node.](./screenshots/03_ah_registry_config.png) |
|*Arrowhead Registry configuration node.* |

#### 1.2.4 AH System

Used to register ```Arrowhead``` systems (e.g. register NodeRed instance as a consumer).

| |
|---|
| ![Arrowhead System configuration node.](./screenshots/04_ah_system_config.png)|
| *Arrowhead System configuration node.* |

## 2. Under development

The nodes are under development at this moment. Token validation node is missing for now.

## 3. Docker image to try it from the repository

You can test the module using docker and a node-red image.

This commands will remove (if exists) the old container, build a new image and run a new container with ```node-red-contrib-arrowhead``` installed.

- Remove old image:

```console
docker stop ah_node-red
docker rm ah_node-red
```

- Build image:

```console
docker build --tag ah_node-red:latest .
```

- Run:

```console
docker run --publish 1880:1880 --detach --name ah_node-red ah_node-red:latest
```

- It will be abailable at [http://localhost:1880](http://localhost:1880).


## Authoring

Developed at [Mondragon Unibertsitatea](https://www.mondragon.edu/) during the participation of the European project [**Arrowhead Tools**](https://www.arrowhead.eu/arrowheadtools).

Main developers:
- [Alain Perez Riaño](https://www.mondragon.edu/en/bachelor-degree-computer-engineering/lecturers/-/profesor/alain-perez-riano)
- [Felix Larrinaga Barrenechea](https://www.mondragon.edu/en/bachelor-degree-computer-engineering/lecturers/-/profesor/felix-larrinaga-barrenechea)
- William Steven Ochoa Agurto