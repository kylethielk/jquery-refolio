jquery-refolio
==============

A jquery plugin. A portfolio jquery plugin. 

![refolio Screenshot](https://raw.github.com/kylethielk/jquery-refolio/master/screenshot.jpg)

Sample Usage
------------

See sample.html for a basic example. Once you have included both the stylesheet and refolio.js (or refolio.min.js) a simple call will suffice:

` $("#portfolio").refolio({
            bar:'top',
            width:700,
            styleContainer:true,
            items:[...]});`

'#portfolio' is the id of any html element.

Each item is an object with the following structure:

`{
	image:'HREF for image',
	title:'Project title',
	tags:['tag1','tag2'],
	description: 'Project Description',
	link: 'Optional HREF to project'
}`

Options
-------

**bar**: Default=*'top'*, Currently the only option is top, but future support for bottom, left and right.

**width**: Default=*700*, Width of entire portfolio. We recommend a width of atleast 500.

**styleContainer**: Default=*false*, Whether or not to style the main refolio container.

**linkTarget**: Default=*'_blank'*, Target of item link.

**items**: List of items to display. See Sample Usage for syntax.