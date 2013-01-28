/**
 * @author Kyle Thielk - http://www.bitofnothing.com
 */

(function ($)
{
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
     * Current index of our thumbnails, where currentIndex is the first visible item on the left.
     * @type {Number}
     */
    var currentIndex = 0;

    /**
     * Add listener for image thumbnails.
     * @param {*} _this JQuery selector for element refolio was activated on.
     * @param {*} image JQuery selector for image.
     */
    var addImageListeners = function (_this, image)
    {
        image.click(function ()
        {

            var imageWidth = image.width();
            var imageHeight = image.height();

            //Duplicate Image
            var additionalImage = $("<img>")
                .attr('src', image.attr('src'))
                .css('width', image.css('width'))
                .css('height', image.css('height'))
                .css('position', 'absolute');


            //Get current thumbnail's position
            var pos = image.position();

            //Overlay duplicate on source
            var sliderLeft = parseInt($("#slider").css("left"));
            additionalImage.css('top', pos.top).css('left', pos.left + sliderLeft);

            //Add image to HTML
            _this.append(additionalImage);

            //Animate scaling image and moving to new location
            var newWidth = (visibleWidth / 2) - 20;
            var scaleRatio = newWidth / imageWidth;
            var height = imageHeight * scaleRatio;
            additionalImage.animate({width:newWidth, height:height, top:'190', left:'25'}, 750);

        });
    };

    /**
     * Initializes refolio.
     *
     * @param {*} options See entry point for more details.
     */
    var init = function (options)
    {
        var settings = $.extend({
            bar:'top',
            width:700,
            items:[]
        }, options);

        //Build a bunch of HTML and add it to screen
        visibleWidth = settings.width;

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

            var image = $("<img>")
                .attr("src", settings.items[i].image)
                .css("height", "110px")
                .css("cursor", "pointer");

            addImageListeners(this, image);

            li.append(image);
            sliderList.append(li);
        }

        slider.append(sliderList);
        sliderWrapper.append(slider);

        this.append(sliderWrapper);

        //Build left & right arrows
        var leftArrow = buildArrow('left').hide();
        sliderWrapper.append(leftArrow);

        var rightArrow = buildArrow('right');
        sliderWrapper.append(rightArrow);

        setTimeout(function ()
        {
            //Place right arrow at right edge of visible content
            rightArrow.css('left', sliderWrapper.width() - 35);
        }, 1);

        //Make relative so inner absolute items, are absolute relative to us.
        this.css("position", "relative");

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
        currentIndex--;

        var slider = $("#slider");

        var items = $("#slider > ul > li");
        var width = $(items[currentIndex]).outerWidth();

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

        var items = $("#slider > ul > li");
        var width = $(items[currentIndex]).outerWidth(true);

        var currentLeft = parseInt(slider.css('left'));
        var nextLeft = currentLeft - (width);

        slider.animate({left:nextLeft + "px"}, 350);

        currentIndex++;

        //Hide right arrow, if no more elements to right to show
        if ((-(nextLeft) + visibleWidth) >= (barWidth - 70))
        {
            $("#rightArrow").hide();
        }

        $("#leftArrow").show();

    };
    /**
     * Calculates required attributes for width of all items, including hidden ones.
     */
    var calculateLayout = function ()
    {
        $(window).load(function ()
        {
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
     * @param options: {
     *  bar: 'top', valid options are top or bottom
     *  width: 700, width of visible content
     *  items: [], arrow of items where each item is {image: 'src of image',tags: [array of tags],description: "", link: ""}
     * }.
     * @return {jQuery} .
     */
    $.fn.refolio = function (options)
    {
        init.apply(this, arguments);
        calculateLayout();
        return this;

    };

})(jQuery);