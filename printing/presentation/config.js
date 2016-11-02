
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
        'RequireJS, Gulp, Grunt, bower, npm, ++',
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
        '<span class=\'comment\'>Comment: Consistency Requirement implies Server Side Solution</span>',
        '<span class=\'comment\'>Comment: Code Reuse implies Headless Browser Approach</span>',
        '<span class=\'comment\'>Comment: Both Phantom and WK use (versions of) QTWebkit</span>'
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
        'Can we get a header and footer?',
        'Are images handled?',
        'Will D3 render correctly?',
        'Can we set the page size?',
        'Can we do anything with Tables?'
    ] },
    { title: 'Demo of Current State', bullets: [] },
    { title: 'Final Comments', bullets: [
        'Code Reuse: add Route for printed version of report',
        'Vertical and Horizontal Table Page Breaks',
        'Security: TLSP vs Independent, SSO',
    ] },
];

pages[0].bullets = pages.map(function (d) { return d.title; });
