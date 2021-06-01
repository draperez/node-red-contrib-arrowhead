FROM nodered/node-red:latest-12-minimal
# RUN npm install axios
COPY --chown=node-red:node-red . /node-red-contrib-arrowhead
COPY --chown=node-red:node-red ./my_flows.json /data/flows.json
RUN npm install /node-red-contrib-arrowhead
