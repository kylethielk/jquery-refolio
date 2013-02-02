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
            styleContainer:true,
            items:[]
        }, options);

        refolio = this;
        refolio.css('width', settings.width);

        if (settings.styleContainer)
        {
            refolio.addClass("refolio-container");
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

        var previousIndex = selectedIndex;

        selectedIndex = event.data.index;

        //Hide previous selection titleOverlay
        $("#overlay_" + previousIndex).animate({height:0}, 350, '', function ()
        {
            $(this).removeClass("refolio-title-overlay-selected");
        });
        $("#overlay_" + selectedIndex).addClass("refolio-title-overlay-selected");

        var imageWidth = $(this).width();
        var imageHeight = $(this).height();

        //Duplicate Image
        var additionalImage = $("<img>")
            .attr('src', $(this).attr('src'))
            .attr('id', 'refolio_image_' + selectedIndex)
            .css('width', $(this).css('width'))
            .css('height', $(this).css('height'))
            .css('position', 'absolute')
            .css("opacity", 0.1);


        //Get current thumbnail's position
        var pos = $(this).parent().position();

        //Overlay duplicate on source
        var sliderLeft = parseInt($("#slider").css("left"));
        additionalImage.css('top', pos.top + 20).css('left', pos.left + sliderLeft);

        //Add image to HTML
        refolio.append(additionalImage);

        //Animate scaling image and moving to new location
        var newWidth = (visibleWidth / 2) - 20;
        var scaleRatio = newWidth / imageWidth;
        var height = imageHeight * scaleRatio;
        additionalImage.animate({width:newWidth, height:height, top:'190', left:'15', opacity:1}, 750);

        $("#refolio_image_" + previousIndex).fadeOut(600, function ()
        {
            $("#refolio_image_" + previousIndex).remove();
        });

        $("#informationContainer").fadeOut(600, function ()
        {
            if (event && event.data)
            {
                $("#informationTitle").html(event.data.title);
                $("#informationDescription").html(event.data.description);

                $("#informationTags").empty();

                $.each(event.data.tags, function (index, tag)
                {
                    $("#informationTags").append($("<span>").addClass("refolio-tag").html(tag));
                });
                $("#informationContainer").fadeIn(300);
            }
        });
    };


    var buildThumbnailItem = function (index)
    {

    };

    /**
     * Build arrow item.
     * @param {String} leftOrRight Valid options are 'right' or 'left'.
     * @return {*|jQuery} JQuery Selector for the arrow.
     */
    var buildArrow = function (leftOrRight)
    {
        var arrowContainer = $("<div>")
            .attr('id', leftOrRight + 'Arrow')
            .addClass("float-" + leftOrRight + "-arrow-container");

        var arrowEntity = "&larr;";
        if (leftOrRight == "right")
        {
            arrowEntity = "&rarr;";
        }

        var arrow = $("<div>")
            .addClass("float-" + leftOrRight + "-arrow")
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
                    arrow.css("opacity", 1.0);
                    return false;
                },
                mouseout:function ()
                {
                    arrow.css("opacity", 0.4);
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

        var slider = $("#slider");

        //Scroll images to right, exact width of first image to left of viewable pane.
        var items = $("#slider > ul > li");
        var width = $(items[scrollIndex]).outerWidth();

        var currentLeft = parseInt(slider.css('left'));
        var nextLeft = currentLeft + (width + 20);

        //sanity...Don't let us extend past edge
        if (nextLeft > 0)
        {
            nextLeft = 0;
        }

        slider.animate({left:nextLeft + "px"}, 350);

        //Disable left click if we can't scroll left anymore
        if (nextLeft == 0)
        {
            $("#leftArrow").hide();
        }

        //Show right-click, if we have enough elements to scroll right
        if ((barWidth - 70) > visibleWidth)
        {
            $("#rightArrow").show();
        }

    };

    /**
     * The click listener for right arrow.
     */
    var rightArrowClick = function ()
    {
        var slider = $("#slider");

        //Scoot the images to left (x)px where (x)= width of left most visible image
        var items = $("#slider > ul > li");
        var width = $(items[scrollIndex]).outerWidth(true);

        var currentLeft = parseInt(slider.css('left'));
        var nextLeft = currentLeft - (width);

        slider.animate({left:nextLeft + "px"}, 350);

        scrollIndex++;

        //Hide right arrow, if no more elements to right to show
        if ((-(nextLeft) + visibleWidth) >= (barWidth - 70))
        {
            $("#rightArrow").hide();
        }

        $("#leftArrow").show();

    };
    var buildHtml = function()
    {
        //Wrapper that hides elements extending past visibleWidth
        var sliderWrapper = $("<div>")
            .attr("id", "slider-wrapper")
            .css("width", visibleWidth + "px");

        //The container holding all items, even the hidden ones.
        var slider = $("<div>")
            .attr("id", "slider");

        var sliderList = $("<ul>");


        for (var i = 0; i < settings.items.length; i++)
        {
            //Build image and list item
            var li = $("<li>");

            var div = $("<div>").css("position", "relative").addClass("refolio-thumbnail");


            var image = $("<img>")
                .attr("src", settings.items[i].image)
                .css("height", "110px")
                .css("cursor", "pointer");

            var span = $("<span>").addClass("refolio-title-overlay").attr('id', 'overlay_' + i);


            var p = $("<p>").css("margin", "5px 0 0 0 ");

            image.click($.extend({index:i}, settings.items[i]), imageClick);
            div.mouseenter({index:i}, function (e)
            {
                $("#overlay_" + e.data.index).animate({height:30}, 350);
            });
            div.mouseleave({index:i}, function (e)
            {
                //Don't hide selectedItem
                if (e.data.index != selectedIndex)
                {
                    $("#overlay_" + e.data.index).animate({height:0}, 350);
                    //We simply hovered over an item, but didn't select it, reshow selected item title
                    $("#overlay_" + selectedIndex).animate({height:30}, 350);
                }

            });

            div.append(image);
            div.append(span.append(p.html(settings.items[i].title)));

            li.append(div);
            sliderList.append(li);
        }

        slider.append(sliderList);
        sliderWrapper.append(slider);

        refolio.append(sliderWrapper);

        //Build left & right arrows
        var leftArrow = buildArrow('left').hide();
        sliderWrapper.append(leftArrow);

        var rightArrow = buildArrow('right');
        sliderWrapper.append(rightArrow);

        //Cheat, only place right arrow after init() has returned, so that we get correct width
        //for sliderWrapper
        setTimeout(function ()
        {
            //Place right arrow at right edge of visible content
            rightArrow.css('left', sliderWrapper.width() - 35);
        }, 1);

        //Make relative so inner absolute items, are absolute relative to us.
        refolio.css("position", "relative");
        refolio.css("overflow", "hidden");



        var informationContainer = $("<div>")
            .attr("id", "informationContainer")
            .css('width', visibleWidth / 2)
            .css('position', 'absolute')
            .css('top', 190)
            .css('left', visibleWidth / 2);

        var h2 = $("<h2>")
            .attr("id", "informationTitle")
            .addClass("refolio-h2");

        var description = $("<p>")
            .attr("id", "informationDescription")
            .addClass("refolio-description");

        var tags = $("<div>")
            .attr('id', "informationTags");

        informationContainer.append(h2);
        informationContainer.append(description);
        informationContainer.append(tags);

        refolio.append(informationContainer);
    };
    /**
     * Calculates required attributes for width of all items, including hidden ones and images.
     */
    var calculateLayout = function ()
    {
        $(window).load(function ()
        {

            //Figure out total width of all elements, including hidden
            barWidth = 0;

            jQuery("#slider > ul > li").each(function (index, value)
            {
                barWidth += $(this).outerWidth(true);
            });

            if (barWidth <= visibleWidth)
            {
                $("#rightArrow").hide();
            }

            //add 35px for each arrow
            barWidth += 70;

            $("#slider").css('width', barWidth);

        });
    };

    /**
     * Entry point to refolio
     * options: {
     *  bar: 'top', valid options are top or bottom
     *  width: 700, width of visible content
     *  items: [], arrow of items where each item is {image: 'src of image',tags: [array of tags],description: "", link: ""}
     * }.
     * @return {jQuery} .
     */
    $.fn.refolio = function ()
    {
        init.apply(this, arguments);
        buildHtml();
        calculateLayout();
        return this;

    };

})(jQuery);