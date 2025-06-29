

angular.module('AsposeViewerApp').controller('ViewerController', function ($scope, $http, $q) {

	var initialized = false;
	var ContentDataLoaded = false;
	var ContentAPICallStarted = false;   
	$scope.loading = false;

	$scope.Init = function () {
		if (initialized === false) {
			initialized = true;
			$.support.cors = true;
			$('#viewer').viewer({
				applicationPath: asposeViewerAPI,
				documentGuid: fileName,
				FolderPath: FolderPath,
				ContentID: ContentID,
				ObjectTypeID: ObjectTypeID,
				defaultDocument: fileName,
				htmlMode: true,
				preloadPageCount: 1,
				zoom: true,
				pageSelector: true,
				search: false,
				thumbnails: false,
				rotate: false,
				download: false,
				upload: false,
				print: false,
				browse: false,
				rewrite: true,
				saveRotateState: false,
				enableRightClick: false
			});
			$('#gd-pages').on('click', 'a', function (el) {
				var h = $(this).attr('href');
				if (h.startsWith('#_page')) {
					var pageNumber = parseInt(h.split('_')[1].substring(4));
					appendHtmlContent(pageNumber, fileName, function() {
						window.location.href = h;
						setNavigationPageValues(pageNumber, totalPageNumber);
						if (pageNumber > 1) { // load previous page
							appendHtmlContent(pageNumber - 1, fileName, function() { // load next page
								if (pageNumber < totalPageNumber) {
									appendHtmlContent(pageNumber + 1, fileName, function() {});
								}
							});
						}
					});
				} else
					window.open(h);
				return false;
			});
			
			// var beforeQueryString = window.location.href.split("?")[0];
			// window.history.pushState({}, document.title, beforeQueryString);
		}
	};

	

	
	$scope.Download = function (outputType) {
		$('#page-loading').show();
		$('#loader').show();
		$http({
			type: 'POST',
			url: asposeViewerAPI + 'Download' + "?fileName=" + fileName + "&folderName=" + folderName + "&outputType=" + outputType,
			//data: {
			//	'folderName': folderName,
			//	'fileName': fileName,
			//	'outputType': outputType
			//},			
			responseType: "application/json"
		}).then(function (response) {
			var data = response.data;
			if (data.StatusCode === 200)
				window.location = fileDownloadLink + "?fileName=" + data.FileName + "&folderName=" + data.FolderName;
			else
				$scope.ShowError(data.Status);
		}, function (error) {
			$scope.ShowError(error.message);
		}).finally(function () {
			$('#page-loading').fadeOut(600);
		});
	};

	$scope.ShowError = function (message) {
		$('#alert > p')[0].innerText = message;
		$('#alert').show();
	}; 
	$scope.onLoad=function()
	{
		if(ContentDataLoaded==true)
			$scope.LoadEditor();
		else
		{
			if(ContentAPICallStarted==false)
				$scope.LoadContent();
			setTimeout($scope.onLoad, 1000);
		}
	}
	$scope.LoadEditor=function()
	{
		 $scope.Init();
	}
	$scope.LoadContent= function()
	{
	   var _ContentID = "";		   
	   var urlParams1 = new URLSearchParams(window.location.search)
       if (urlParams1.has('ContentID')) {
           // console.log(urlParams1.get('ContentID').split("?")[0])
            _ContentID = urlParams1.get('ContentID').split("?")[0];
	   }
	   
	   
			if(ContentDataLoaded==false && ContentAPICallStarted==false)
			{
				var xhttp = new XMLHttpRequest();				
				xhttp.onreadystatechange = function () {
					if (this.readyState == 4 && this.status == 200) {
						if (xhttp.responseText != "") {                  
							//console.log(xhttp.responseText);
							
							var documentData= JSON.parse(xhttp.responseText);
							window.asposeViewerAPI = basicPlatformData.WebAPIUrl + 'Document/';
							window.fileName = documentData.fileName; //'/en-us/640e98ae-d6ee-4f40-b891-0469870e39e5.pdf';
							window.productName = 'Pdf';
							window.FolderPath = documentData.FolderPath; //'AB6856F3-BAFB-42A4-9C84-0E77EC1A4038';
							window.ContentID = documentData.ContentID;
							window.ObjectTypeID = documentData.ObjectTypeID;						//'ab6856f3-bafb-42a4-9c84-0e77ec1a4038';
							window.fileDownloadLink = basicPlatformData.WebAPIUrl + 'common/download';
							ContentDataLoaded=true;
						}
					}
				};                        
				xhttp.open("get", basicPlatformData.WebAPIUrl + "Document/GetDetails?ContentID=" + _ContentID, true);
				xhttp.setRequestHeader("AllowWindowsandMobileApps", "allow");
				xhttp.setRequestHeader("UserID", UserContext.UserID);
				xhttp.setRequestHeader("SiteID", UserContext.SiteID);
				xhttp.setRequestHeader("ClientURL",  UserContext.ClientURL);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.setRequestHeader("Authorization", "Bearer " + UserContext.JwtToken);
				xhttp.send();
				ContentAPICallStarted=true;
			}
	 }	
	$scope.onLoad();	
});