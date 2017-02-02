
var reportUrl = 'http://localhost:8080/WAC.html?model=fakeBCModel.json';
var fs = require('fs');
var CookieJar = "cookiejar.json";

var page = require('webpage').create();

var title = 'Workshop Asssessment Class Report';
var subTitle = 'Class 1 - Read 180';
var logoFile = 'images/d3Report/work_shop_logo.svg';

var getSchoolClassesURL = function(hostId, schoolId, classId) {
  var scheme = "http";
  var domain = ".education.scholastic.com"
  // https://h503000001.education.scholastic.com/HMHCentral/api/schools/empjhp0412vfv6ldrj18ltoo_1uamve0/classes/plupr0hig81pb0m6h7cqgid9_1uamve0
  var url = scheme + "://" + hostId + domain + "/HMHCentral/api/schools/" + schoolId + "/classes/" + classId;
  return url;
}

var getClassHeaderInfo = function (response) {
  var obj = response;
  if (typeof response === 'string')
  {
    try {
      obj = JSON.parse(response);
    } catch (err) {
      console.error(err);
    }
  }
  var className = obj.basicInformation.className;
  var grades = obj.basicInformation.selectedGrades.map(function(currentGrade) {
      return currentGrade.abbreviatedName;
  }).join(", ");
  var teachers = obj.basicInformation.teachers.map(function(currentTeacher) {
    var teacherName = currentTeacher.lastName + "," + currentTeacher.firstName;
    return teacherName;
  }).join("; ");
  var retval = {className: className, grades: grades, teachers: teachers};
  return retval;
};

var getClassHeaderInfoTable = function (classInfo)
{
  var tbl = "<table>";
  tbl = tbl + "<tr><th>Teacher</th><th>Grade</th><th>School</th><th>Assessment</th></tr>";
  tbl = tbl + "<tr><td>" + classInfo.teachers + "</td><td>" + classInfo.grades + "</td><td>George Washington Carver Middle School</td><td>Workshop Assessment 4</td></tr>";
  tbl = tbl + "</table>";
  return tbl;
}

var getSubTitle = function(classInfo)
{
  var result = "Class: " + classInfo.className;
  var tbl = getClassHeaderInfoTable(classInfo);
  result = result + tbl;
  return result;
}

page.paperSize = {
	//viewportSize: { width: 960, height: 1200 },
	//zoomFactor: .1,
    width: '8.5in',
    height: '11in',
    border: '50px',
    margin: '0px',
    header: {
    	height: '200px',
    	contents: phantom.callback(function (pageNum, numPages) {

        var result = '<div>';
        result = result + '<div id="title" style="text-align: left; font-size: 24px; color: red;">' + title + '</div>';
        result = result + '<div><img src="' + logoFile + '"/></div>';
        result = result + '<div id="subtitle">' + subTitle + '</div>';
        result = result + '</div>';
        console.log(result);
        return result;
      })
    },
    footer: {
        height: '3cm',
        contents: phantom.callback(function (pageNum, numPages) {
            return '<div style="text-align: right; font-size: 12px;"> Check out this footer with page numbers: ' + pageNum + ' / ' + numPages + '</div>';
        })
    }
};

if(fs.isFile(CookieJar)) {
    Array.prototype.forEach.call(JSON.parse(fs.read(CookieJar)), function(x){
        phantom.addCookie(x);
        console.log("added " + JSON.stringify(x));
    });
}
/*
var hostId = "h503000001";
var schoolId = "empjhp0412vfv6ldrj18ltoo_1uamve0";
var classId = "plupr0hig81pb0m6h7cqgid9_1uamve0";
var schoolClassesUrl = getSchoolClassesURL(hostId, schoolId, classId);
console.log("Attempting to open url: " + schoolClassesUrl);

page.open(schoolClassesUrl, function(status) {
    console.log("Loaded " + schoolClassesUrl + " with status: " + status);
    var cookies = page.cookies;
    cookies.forEach (function (cookie) {
      console.log('cookie = ' + JSON.stringify(cookie));
    });
    if (status === "success") {
      var jsonSource = page.plainText;
      console.log(jsonSource);
      var resultObject = JSON.parse(jsonSource);
      var classInfo = getClassHeaderInfo(resultObject);
      subTitle = getSubTitle(classInfo);
      console.log("Generated subTitle: " + subTitle);
*/
      console.log("Loading report page at: " + reportUrl);
      page.open(reportUrl, function(status) {
        console.log("Loaded " + reportUrl + " with status: " + status);
//        console.log('typeof window.setTimeout: ' + (typeof window.setTimeout));
        window.setTimeout(function() {
            var output = "report.pdf";
            console.log("About to render page to: " + output);
            page.render(output)
            phantom.exit();
        }, 2000);
      });
/*
    } else {
      phantom.exit(1);
    }
});
*/
