require 'configatron'
require 'json'
require 'rest_client'
require './config-hmh2.rb'
require 'date'

startTime  = (Time.now)
startstamp = (Time.now.to_i)

base = {
	:sensorId => "%{il_sensorId}",
	:il_sensorId => "%{il_sensorId}"
}
base['apiKey']=configatron.entity.apiKey

doit = true
verbose = true

vals = {:apiKey => configatron.entity.apiKey, 
	:siteId => configatron.siteId, 
	:jvmId => configatron.jvmId, 
	:applicationId => "SLMS"
}

type = ARGV[0]
bad = true
if type == 'entity'
	bad = false
	vals[:il_sensorId] = configatron.entity.il_sensorId
end
if type == 'event'
	bad = false
	vals[:il_sensorId] = configatron.event.spi.il_sensorId
end
if bad 
	puts " "
	puts "First arg MUST BE event OR entity " + type
	puts " "
	return
end

filename = ARGV[1]

timestamp = (Time.now.to_i)

if type == 'entity'
	url = configatron.url + configatron.describeURI
end
if type == 'event'
	url = configatron.url + configatron.learningeventURI
end



if verbose
	puts "sendinging to #{url} #{vals}"
end

File.open(filename).each do |line|

	record = base

	entity = {}
	event = {}
	if type == 'entity'
		entity = JSON.parse(line)
		base['entity'] = entity
	end
	if type == 'event'
		event = JSON.parse(line)
		base['event'] = event
	end

	parsed = eval((base.inspect % vals))
	parsed['timestamp'] = timestamp * 1000

	if verbose
		puts "Sending #{parsed.to_json}"
	end

	if doit 
		if entity['entityData'] || event['eventData']
			response = RestClient.post url + "/batch", parsed.to_json, :content_type => :json, :accept => :json
			puts response.to_str
	 	else
			response = RestClient.post url, parsed.to_json, :content_type => :json, :accept => :json
			puts response.to_str
		end
	end
end

endstamp = (Time.now.to_i)
longth = endstamp - startstamp

puts "=================== #{longth}  #{startTime}  #{Time.now}: Done "

