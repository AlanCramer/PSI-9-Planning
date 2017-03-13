
From this directory you can load a sample stand-alone application that renders an example report.

To make it go, start a local server in this directory. For example, if on MacOS,
python -m SimpleHTTPServer
will do the job.

Then load index.html with the appropriate data model in json. For example,

http://localhost:8000/index.html?modelUrl=modelData/workshopAssessmentMergedModel.json

Should see the page.

With the server running, you should be able to produce the PDF with:

  phantomjs rasterize.js <url> <output file?>

although this is known to create an empty pdf with phantomjs 2.1.1 and the local url above. (you can see your version with "phantomjs --version")

Try, for example,
phantomjs rasterize.js http://www.google.com myout.pdf

generally, that has seemed to work. With the local server running this should work too:
phantomjs rasterize.js http://localhost:8000/again.html  myout.pdf

seems like it does sometimes and not sometimes.
