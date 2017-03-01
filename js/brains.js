function validateDomain(the_domain) {
    var reg = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return reg.test(the_domain);
}
$(document).ready(function() {
    $("#alertDiv").hide();
    $("#tableDiv").hide();
    $("#newSearchDiv").hide();
    
    var subdomains = new Array("www", "mail", "direct", "connect", "cpanel", "ftp", "forum", "forums", "blog", "m", "dev", 
        "webmail", "direct-connect", "java", "swf", "client", "server", "admin", "pop", "imap", "smtp", "beta", "portal",
        "ssl", "dns", "ns1", "ns2", "dns1", "dns2", "record", "ts", "teamspeak", "mobile", "irc", "mumble", "ts3", "help",
        "download", "direct-connect-mail");

    subLen = subdomains.length;

    $('#doSearch').click(function() {
        var domain = $('#domain').val().toLowerCase();
        domain = domain.replace("http://", "");
        domain = domain.replace("https://", "");
        domain = domain.replace("www.", "");
        if ($.trim(domain) == '') {
            $("#alertDiv").removeClass();
            $("#alertDiv").addClass("alert alert-warning");
            $('#alertText').text('You didnt enter in a domain name! Enter in a domain name to perform a lookup');
            $("#alertDiv").toggle();
        } else if (!validateDomain(domain)) {
            $("#alertDiv").removeClass();
            $("#alertDiv").addClass("alert alert-danger");
            $('#alertText').text('That is not a valid domain name! Enter in a valid domain name to perform a lookup.');
            $("#alertDiv").toggle();
        } else {
            $.ajax({
                    url: 'https://tools.xioax.com/cloudflare/resolve.php?fqdn=' + domain,
                    async: false,
                    cache: true,
                    dataType: 'jsonp',
                    success: function(json) {
                        status = json.status;
                        msg = json.msg;
                        fqdnapi = json.fqdn;

                        if(status === 'success') {
                            cloudflare = json.cloudflare;
                            if(cloudflare) {
                                $("#doSearch").prop("disabled", true);
                                $("#domain").prop("disabled", true);
                                $("#tableDiv").toggle();
                                $("#newSearchDiv").toggle();

                                for (i = 0; i < subLen; i++) {
                                    var fqdn = subdomains[i] + '.' + domain;
                                    var api = 'https://tools.xioax.com/cloudflare/resolve.php?fqdn=' + fqdn;
                                    $.ajax({
                                        url: api,
                                        async: false,
                                        cache: true,
                                        dataType: 'jsonp',
                                        success: function(json) {
                                            status = json.status;
                                            msg = json.msg;
                                            fqdnapi = json.fqdn;
                                            if(status === 'success') {
                                                cloudflare = json.cloudflare;
                                                if(cloudflare) {
                                                    document.getElementById("resultsTable").insertRow(-1).innerHTML = '<td>' + fqdnapi  + '</td><td>' + msg + '</td><td>N/A</td>';
                                                } else {
                                                    ip = json.ip;
                                                    document.getElementById("resultsTable").insertRow(-1).innerHTML = '<td><b>' + fqdnapi  + '</b></td><td><b>' + msg + '</b></td><td><b>' + ip + '</b></td>';
                                                }
                                            } else {
                                                document.getElementById("resultsTable").insertRow(-1).innerHTML = '<td>' + fqdnapi  + '</td><td>' + msg + '</td><td>N/A</td>';
                                            }
                                        }
                                    });
                                }
                            } else {
                                $("#alertDiv").removeClass();
                                $("#alertDiv").addClass("alert alert-info");
                                $('#alertText').text(fqdnapi + ' is currently not hosted on CloudFlare. To resolve a CloudFlare hosted domain it must be using CloudFlare DNS.');
                                $("#alertDiv").toggle();
                            }
                        } else {
                            $("#alertDiv").removeClass();
                            $("#alertDiv").addClass("alert alert-danger");
                            $('#alertText').text(fqdnapi + ' is not a valid domain name and/or does not exist. Check the domain and try again.');
                            $("#alertDiv").toggle();
                        }
                    }
            });
        }
    });

    $('#doNew').click(function() {
        $("#resultsTable td").remove();
        $("#tableDiv").toggle();
        $("#newSearchDiv").toggle();
        $("#doSearch").removeAttr('disabled');
        $("#domain").removeAttr('disabled');
        $("#domain").val(null);
    });

    $('#doSettings').click(function() {
        var values = "";
        for (i = 0; i < subLen; i++) {
            values = values + subdomains[i] + "\n";
        }
        document.getElementById('subdomainslist').value = values;
        $("#settingsModal").modal();
    });

    $('#doSettingsSave').click(function() {
        var lines = $('textarea').val().split('\n');
        subdomains.length = 0;

        for(var i = 0;i < lines.length;i++){
            var line = lines[i].replace(/\s+/g, '');
            if(line.trim()) {
                subdomains.push(line);
            }
        }
        
        subLen = subdomains.length;
        $("#settingsModal").modal('hide');

    });

    $('#closeAlert').click(function() {
        $("#alertDiv").toggle();
        $("#alertDiv").removeClass();
    });
});
