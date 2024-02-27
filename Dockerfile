FROM node:16

#Set working directory
WORKDIR /opt/projects

#Copy package.json file
COPY package.json /opt/projects

#Install node packages
RUN npm install && npm install -g nodemon@2.0.16

# Set permissions for node_modules directory
RUN mkdir -p node_modules && chown -R node:node node_modules

#Copy all files 
COPY . /opt/projects

#Expose the application port
EXPOSE 5000

#Start the application
CMD [ "nodemon", "app.js" ]
