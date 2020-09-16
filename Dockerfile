FROM nodered/node-red
RUN npm install axios
COPY . /node-red-contrib-arrowhead
COPY ./my_flows.json /data/flows.json
RUN npm install /node-red-contrib-arrowhead
