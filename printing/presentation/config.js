
var activePage = 0;

var pages = [
    { title: 'Introduction', bullets: [] },
    { title: 'Our Problem', bullets: [
        'Our Product - quick demo',
        'Teacher, Leader, Student logins',
        'WAC Report Example: multiple charts, multiple tables',
        'Intellify Report Printing',
        'Zeplin View: the print specification',
        '----',
        'Comment: Not going to get there with only paged-media CSS'
    ] },
    { title: 'Our Technology Stack', bullets: [
        'Our Client: scent-client',
        'Our Web App: TLSP',
        'Angular',
        'D3',
        'RequireJS, Gulp, Grunt, ++',
        'Intellify',
    ] },
    { title: 'Some PDF Generation Technologies', bullets: [
        '<b>PhantomJS</b> - Headless Browser with PDF Export (HTML to PDF)',
        '<b>wkhtmltopdf</b> - Headless Browser with PDF Export (HTML to PDF)',
        '<b>PDFKit</b> - scripting language to create PDF',
        '<b>PDFMake</b> - PDFKit plus more',
        'Others - <ul style=\'font-size:smaller\'><li>Snappy (wkhtmltopdf wrapper)</li>' +
            '<li>DocRaptor (commercial service)</li>' +
            '<li>wicked_pdf (ruby scripting)</li></ul>',
        'Comment: Consistency Requirement implies Server Side Solution',
        'Comment: Code Reuse implies Headless Browser Approach'
    ] },
    { title: 'Server', bullets: [
        'AWS',
        'Node vs JBOSS',
        'Operations owns Scaling and Load Balancing',
        'Server side process management'
    ] },
    { title: 'Proof Of Concept', bullets: [
        'Start with PhantomJS: somewhat proven',
        'Stand Alone Pages',
        ''
    ] },
    { title: 'Demo of Current State', bullets: [] },
    { title: 'Final Comments', bullets: [
        'Code Reuse: add Route for printed version of report',
        'Security: TLSP vs Independent, SSO'
    ] },
];

pages[0].bullets = pages.map(function (d) { return d.title; });
