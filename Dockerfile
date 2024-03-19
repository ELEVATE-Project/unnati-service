FROM node:16

#Set working directory
WORKDIR /opt/projects

#Copy package.json file
COPY ./package.json /opt/projects/package.json

#Install node packages
RUN npm install
RUN npm install -g nodemon

#Copy all files 
COPY . /opt/projects

#Expose the application port
EXPOSE 5000

#Start the application
CMD ["npm", "run", "dev"]