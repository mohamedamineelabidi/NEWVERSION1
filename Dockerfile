# Use the official Python image from the Docker Hub
FROM python:3.11-slimjj

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run webserver.py when the container launches
CMD ["python", "webserver.py"]