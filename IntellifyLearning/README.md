Intellify Data Generator using JSON file
========================================

Setup:

* Install ruby (2.1.1), rvm (http://rvm.io/) and bundler (http://bundler.io/).  All of these can be installed by executing the following two commands in sequence in a shell (works on Mac OS X and Linux):
  * curl -sSL https://get.rvm.io | bash -s stable --ruby=2.1.1
  * gem install bundler
* Clone this git repo (git clone git@github.com:pnayak/data-generator.git)
* Change into the data-generator directory/folder (cd data-generator)
* Execute the following commands:
  * rvm use ruby-2.1.1
  * rvm gemset create data-generator
  * bundle install

To run:

* Update config.rb settings to desired values (each setting is documented inline)
* Update sample_describes.json - Create one describe per Course and per Student that are referenced in config.rb.  
* Send describes (RUN THIS ONCE) using:
  * ruby generate_describes.rb sample_describes.json  (or any file that has input JSON)
* Update sample.json - Create an array of events in this file.  These are supposed to represent one "session" for a student.  The generator plays this once per student, per course as configured in config.rb
* Send events using (RUN AS MANY TIMES AS NEEDED):
  * ruby generate.rb sample.json  (or any file that has input JSON)
