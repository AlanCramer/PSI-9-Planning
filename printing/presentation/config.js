
var activePage = 0;

var pages = [
    { title: 'Introduction', bullets: [] },
    { title: 'Our Problem', bullets: [
        'Our Product - quick demo',
        'Teacher, Leader, Student logins',
        'WAC Report Example: multiple charts, multiple tables',
        'Intellify Report Printing',
        'Zeplin View: the print specification'
    ] },
    { title: 'Our Technology Stack', bullets: [
        'Our Client: scent-client',
        'Our Web App: TLSP',
        'Angular',
        'D3',
        'RequireJS, Gulp, Grunt, ++',
        'Intellify',
    ] },
    { title: 'Some HTML to PDF Technologies', bullets: [
        'PhantomJS',
        'PDFKit',
        'PDFMake',
        'wkhtmltopdf',
        'Comment: Consistency Requirement implies Server Side Solution'
    ] },
    { title: 'Proof Of Concept', bullets: [
        'Start with PhantomJS: somewhat proven',
        'Stand Alone Pages',
    ] },
    { title: 'Demo of Current State', bullets: [] }
];

pages[0].bullets = pages.map(function (d) { return d.title; });
