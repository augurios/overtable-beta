
(function() {
    'use strict';

    angular
        .module('application.core')
        	.constant('PATHS',
        				{
					        TEMPLATE: base_url+'public/app/modules/',
				    	}
				    )
        	.constant('REGEX',
        				{
					        email: /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
					        whitespace : /\S/,
					        number: "^[0-9]*$",
					        youtube: /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/,
					        facebook: /(?:http:\/\/)?(?:www\.)?facebook\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/,
					        instagram: /(https?:\/\/)?([\w\.]*)instagram\.com\/([a-zA-Z0-9_-]*)$/,
					        twitter: /(https?:\/\/)?([\w\.]*)twitter\.com\/([a-zA-Z0-9_-]*)$/,
					       // hexcode: "^[^-\s][a-zA-Z0-9_\s-]+$",
					        hexcode: /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i,
					        time: {
					        	hhmm: /([01]\d|2[0-3]):([0-5]\d)/,
					        }
					        //twitter: /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
				    	}
				    )
        	
})();