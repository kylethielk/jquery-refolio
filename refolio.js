/**
 * @author Kyle Thielk - http://www.bitofnothing.com
 *
 * Please use or modify as you see fit. I would appreciate any mention
 * or attribution.
 *
 * @license Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to
 * whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function ($)
{
    /**
     * JQuery selector of our refolio container
     * @type {Object}
     */
    var refolio = undefined;

    /**
     * The entire width of all elements in slider, including hidden ones.
     * @type {Number}
     */
    var barWidth = 0;
    /**
     * The width of what is visible on screen.
     * @type {Number}
     */
    var visibleWidth = 0;

    /**
     * Tracks the index of the current item shown to the very left of the screen.
     * @type {Number}
     */
    var scrollIndex = 0;

    /**
     * The index of the item currently selected.
     * @type {Number}
     */
    var selectedIndex = -1;

    /**
     * Our configurable settings.
     * @type {Object}
     */
    var settings = {};

    /**
     * Initializes refolio.
     *
     * @param {*} options See entry point for more details.
     */
    var init = function (options)
    {

        settings = $.extend({
            bar:'top',
            width:700,
            styleContainer:false,
            linkTarget:'_blank',
            items:[]
        }, options);

        refolio = this;
        refolio.css('width', settings.width);

        if (settings.styleContainer)
        {
            refolio.addClass('refolioContainer');
        }

        //Build a bunch of HTML and add it to screen
        visibleWidth = settings.width;

    };

    /**
     * Called whenever a thumbnail image is clicked.
     * @param event The click event.
     */
    var imageClick = function (event)
    {
        if (event.data.index == selectedIndex)
        {
            return;
        }

        selectItem(event.data.index);

    };

    var selectItem = function (index)
    {
        var previousIndex = selectedIndex;

        selectedIndex = index;

        var thumbnail = $('#refolioThumbnail' + selectedIndex);

        //Hide previous selection titleOverlay
        $('#spanTitleOverlay' + previousIndex).animate({height:0}, 350, '', function ()
        {
            $('#spanTitleOverlay' + previousIndex).removeClass('refolioTitleOverlaySelected');
        });

        if (!$('#spanTitleOverlay' + selectedIndex).is(':animated'))
        {
            $('#spanTitleOverlay' + selectedIndex).animate({height:30}, 350);
        }
        $('#spanTitleOverlay' + selectedIndex).addClass('refolioTitleOverlaySelected');


        var imageWidth = thumbnail.width();
        var imageHeight = thumbnail.height();

        //Duplicate Image
        var fullSizeImage = $('<img>')
            .attr('src', thumbnail.attr('src'))
            .attr('id', 'refolioImage' + selectedIndex)
            .css('width', thumbnail.css('width'))
            .css('height', thumbnail.css('height'))
            .css('position', 'absolute')
            .css('opacity', 0.1);


        //Get current thumbnail's position
        var pos = thumbnail.parent().position();

        //Overlay duplicate on source
        var sliderLeft = parseInt($('#slider').css('left'));
        fullSizeImage.css('top', pos.top + 20).css('left', pos.left + sliderLeft);

        //Add image to HTML
        refolio.append(fullSizeImage);

        //Animate scaling image and moving to new location
        var newWidth = (visibleWidth / 2) - 20;
        var scaleRatio = newWidth / imageWidth;
        var height = imageHeight * scaleRatio;
        fullSizeImage.animate({width:newWidth, height:height, top:'190', left:'15', opacity:1}, 750, '', function ()
        {
            if (settings.items[index].link)
            {
                fullSizeImage.wrap($('<a>').attr('href', settings.items[index].link).attr('target', settings.linkTarget));
            }
        });

        //Remove previous image
        $('#refolioImage' + previousIndex).fadeOut(600, function ()
        {
            $('#refolioImage' + previousIndex).remove();
        });

        //Fade out old title,description, tags, fade in new ones
        $('#informationContainer').fadeOut(600, function ()
        {
            if (settings && settings.items && settings.items[index])
            {
                if ($('#informationTitle').parent().is('a'))
                {
                    if (settings.items[index].link)
                    {
                        $('#informationTitle').parent().attr('href', settings.items[index].link);
                    }
                    else
                    {
                        $('#informationTitle').unwrap();
                    }
                }
                else if (settings.items[index].link)
                {
                    $('#informationTitle').wrap(
                        $('<a>')
                            .attr('target', settings.linkTarget)
                            .attr('href', settings.items[index].link)
                            .addClass('refolioTitleLink')
                    );

                }

                $('#informationTitle').html(settings.items[index].title);
                $('#informationDescription').html(settings.items[index].description);

                $('#informationTags').empty();

                $.each(settings.items[index].tags, function (index, tag)
                {
                    $('#informationTags').append($('<span>').addClass('refolioTag').html(tag));
                });

                $('#informationContainer').fadeIn(300);
            }
        });
    };

    /**
     * Build arrow item.
     * @param {String} leftOrRight Valid options are 'right' or 'left'.
     * @return {*|jQuery} JQuery Selector for the arrow.
     */
    var buildArrow = function (leftOrRight)
    {
        var leftOrRightCapped = leftOrRight.substr(0, 1).toUpperCase() + leftOrRight.substr(1);

        var arrowContainer = $('<div>')
            .attr('id', leftOrRight + 'Arrow')
            .addClass('float' + leftOrRightCapped + 'ArrowContainer');

        var arrowEntity = '&larr;';
        if (leftOrRight == 'right')
        {
            arrowEntity = '&rarr;';
        }

        var arrow = $('<div>')
            .addClass('float' + leftOrRightCapped + 'Arrow')
            .append(arrowEntity);

        if (leftOrRight == 'left')
        {
            arrow.click(leftArrowClick);
        }
        else
        {
            arrow.click(rightArrowClick);
        }

        arrowContainer.on(
            {
                mouseover:function ()
                {
                    arrow.css('opacity', 1.0);
                    return false;
                },
                mouseout:function ()
                {
                    arrow.css('opacity', 0.4);
                    return false;
                }
            }
        );

        arrowContainer.append(arrow);

        return arrowContainer;
    };

    /**
     * The click listener for the left arrow.
     */
    var leftArrowClick = function ()
    {
        scrollIndex--;

        var slider = $('#slider');

        //Scroll images to right, exact width of first image to left of viewable pane.
        var items = $('#slider > ul > li');
        var width = $(items[scrollIndex]).outerWidth();

        var p = $(items[scrollIndex]).position();
        var currentLeft = parseInt(slider.css('left'));
        var nextLeft = currentLeft + (width + 20) - previousLeftBuffer;

        previousLeftBuffer = 0;

        //sanity...Don't let us extend past edge
        if (nextLeft > 0)
        {
            nextLeft = 0;
        }
        slider.animate({left:nextLeft + 'px'}, 350);

        //Disable left click if we can't scroll left anymore
        if (nextLeft == 0)
        {
            $('#leftArrow').hide();
        }

        //Show right-click, if we have enough elements to scroll right
        if ((barWidth - 70) > visibleWidth)
        {
            $('#rightArrow').show();
        }

    };

    /**
     * When scrolling items to left, or hitting right arrow, the last item we might
     * have to force the positioning so that the item sticks to the right
     * side, rather than end up in the middle of the screen.
     *
     * If we force the positioning, this is the amount of forcing we had to do in pixels
     * so it can be accounted for in the next leftArrowClick.
     *
     * @type {Number}
     */
    var previousLeftBuffer = 0;

    /**
     * The click listener for right arrow.
     */
    var rightArrowClick = function ()
    {
        var slider = $('#slider');

        //Scoot the images to left (x)px where (x)= width of left most visible image
        var items = $('#slider > ul > li');
        var width = $(items[scrollIndex]).outerWidth(true);

        var currentLeft = parseInt(slider.css('left'));
        var nextLeft = currentLeft - (width);

        if (nextLeft < (visibleWidth - barWidth))
        {
            var oldLeft = nextLeft;
            nextLeft = visibleWidth - barWidth + 40;

            previousLeftBuffer = nextLeft - oldLeft;
        }

        slider.animate({left:nextLeft + 'px'}, 350);

        scrollIndex++;

        //Hide right arrow, if no more elements to right to show
        if ((-(nextLeft) + visibleWidth) >= (barWidth - 70))
        {
            $('#rightArrow').hide();
        }

        $('#leftArrow').show();

    };
    /**
     * Builds HTML for refolio.
     */
    var buildHtml = function ()
    {
        //Wrapper that hides elements extending past visibleWidth
        var sliderWrapper = $('<div>')
            .attr('id', 'sliderWrapper')
            .css('width', visibleWidth + 'px');

        //The container holding all items, even the hidden ones.
        var slider = $('<div>')
            .attr('id', 'slider');

        var sliderList = $('<ul>');
        for (var i = 0; i < settings.items.length; i++)
        {
            var li = buildThumbnailItemHtml(i);
            sliderList.append(li);
        }

        refolio.append(
            sliderWrapper.append(
                slider.append(sliderList)));


        //Build left & right arrows
        var leftArrow = buildArrow('left').hide();
        sliderWrapper.append(leftArrow);

        var rightArrow = buildArrow('right');
        sliderWrapper.append(rightArrow);

        //Cheat, only place right arrow after buildHtml() has returned, so that we get correct width
        //for sliderWrapper
        setTimeout(function ()
        {
            //Place right arrow at right edge of visible content
            rightArrow.css('left', sliderWrapper.width() - 35);
        }, 1);

        //Make relative so inner absolute items, are absolute relative to us.
        refolio.css('position', 'relative');
        refolio.css('overflow', 'hidden');


        //Build container that holds selected item
        var informationContainer = $('<div>')
            .attr('id', 'informationContainer')
            .css('width', visibleWidth / 2)
            .css('position', 'absolute')
            .css('top', 190)
            .css('left', visibleWidth / 2)
            .addClass('informationContainer');

        var title = $('<h2>')
            .attr('id', 'informationTitle')
            .addClass('refolioTitle');

        var description = $('<p>')
            .attr('id', 'informationDescription')
            .addClass('refolioDescription');

        var tags = $('<div>')
            .attr('id', 'informationTags');


        refolio.append(
            informationContainer
                .append(title)
                .append(description)
                .append(tags));
    };

    /**
     * Builds html for thumbnail at given index.
     * @param {Number} index
     * @return {*|jQuery|HTMLElement}
     */
    var buildThumbnailItemHtml = function (index)
    {
        //Build image and list item
        var li = $('<li>');

        var div = $('<div>')
            .css('position', 'relative')
            .addClass('refolioThumbnail');


        var thumbnail = $('<img>')
            .attr('src', settings.items[index].image)
            .attr('id', 'refolioThumbnail' + index)
            .css('height', '110px')
            .css('cursor', 'pointer');

        var span = $('<span>')
            .addClass('refolioTitleOverlay')
            .attr('id', 'spanTitleOverlay' + index);


        var p = $('<p>')
            .css('margin', '5px 0 0 0 ');

        //Register click listener
        thumbnail.click($.extend({index:index}, settings.items[index]), imageClick);

        //Register listeners for hover title
        div.mouseenter({index:index}, function (e)
        {
            $('#spanTitleOverlay' + e.data.index).animate({height:30}, 350);
        });
        div.mouseleave({index:index}, function (e)
        {
            //Don't hide selectedItem
            if (e.data.index != selectedIndex)
            {
                $('#spanTitleOverlay' + e.data.index).animate({height:0}, 350);
                //We simply hovered over an item, but didn't select it, reshow selected item title
                $('#spanTitleOverlay' + selectedIndex).animate({height:30}, 350);
            }

        });

        div.append(thumbnail);
        div.append(span.append(p.html(settings.items[index].title)));

        li.append(div);

        return li;
    };
    /**
     * Calculates required attributes for width of all items, including hidden ones and images.
     */
    var calculateLayout = function (callback)
    {
        callback = callback || function ()
        {
        };
        $(window).load(function ()
        {

            //Figure out total width of all elements, including hidden
            barWidth = 0;

            jQuery('#slider > ul > li').each(function (index, value)
            {
                barWidth += $(this).outerWidth(true);
            });

            if (barWidth <= visibleWidth)
            {
                $('#rightArrow').hide();
            }

            //add 35px for each arrow
            barWidth += 70;

            $('#slider').css('width', barWidth);
            callback();
        });
    };

    /**
     * Entry point to refolio
     * options: {
     *  bar: 'top', valid options are top or bottom
     *  width: 700, width of visible content
     *  items: [], arrow of items where each item is {image: 'src of image',tags: [array of tags],description: '', link: ''}
     * }.
     * @return {jQuery} .
     */
    $.fn.refolio = function ()
    {
        init.apply(this, arguments);
        buildHtml();
        calculateLayout(function ()
        {
            selectItem(0);
        });

        return this;

    };

})(jQuery);