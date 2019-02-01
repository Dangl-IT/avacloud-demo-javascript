
// If this variable is set, a different endpoint for AVACloud is used,
// e.g. https://avacloud-api-dev.dangl-it.com
const customAvaCloudBaseUrl = '';

// This is the Dangl.Identity OpenID token endpoint
const danglIdentityTokenEndpoint = 'https://identity.dangl-it.com/connect/token';

let globalAccessToken;

// This function retrieves the JWT Token and stores it in an Html input field and in a global variable
async function getAccessToken(clientId, clientSecret, tokenFormFieldId) {
    if (!clientId || !clientSecret) {
        alert('Please provide values for clientId and clientSecret. You can find more info in the tutorial at www.dangl-it.com or the AVACloud documenation.');
        return;
    }
    // This is an OpenID Client Credentials grant request
    const clientCredentialsRequest = new Promise(function (resolve, reject) {
        const requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret));
        requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
        fetch(danglIdentityTokenEndpoint, {
            method: 'post',
            headers: requestHeaders,
            body: 'grant_type=client_credentials&scope=avacloud'
        })
            .then(function (response) {
                response.json().then(j => resolve(j));
            })
            .catch((e) => {
                reject(e);
            });
    });
    try {
        const clientCredentialsResult = await clientCredentialsRequest;
        accessToken = clientCredentialsResult['access_token'];
        if (!accessToken) {
            alert('Failed to obtain an access token. Have you read the documentation and set up your OAuth2 client?');
        } else {
            $(tokenFormFieldId).val(accessToken);
            globalAccessToken = accessToken;
        }
    } catch (e) {
        console.log(e);
        alert('Failed to obtain an access token. Have you read the documentation and set up your OAuth2 client?');
    }
}

// This function displays a list of all positions in the result area
async function listAllPositions() {
    const avaProject = await getAvaProject();
    const servSpec = avaProject
        .serviceSpecifications[0];

    const positionsList = [];
    getPositionsInElementList(servSpec.elements, positionsList);

    let positionListHtml = '<ol>';
    for (var i = 0; i < positionsList.length; i++) {
        positionListHtml += '<li> Item Number: '
            + positionsList[i].itemNumber.stringRepresentation
            + ', Short Text: '
            + positionsList[i].shortText
            + '</li>'
    }
    positionListHtml += '</ol>';

    setHtmlResult(positionListHtml);
}

// This function puts all elements of type PositionDto
// on the 'positionList' array. It calls itself recursively
function getPositionsInElementList(elements, positionsList) {
    if (elements == null) {
        return;
    }
    for (var i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.elementTypeDiscriminator === 'PositionDto') {
            positionsList.push(element);
        } else if (element.elementTypeDiscriminator === 'ServiceSpecificationGroupDto') {
            getPositionsInElementList(element.elements, positionsList);
        }
    }
}

// This class displays the project model as JSON in the result area
async function convertToJson() {
    const avaProject = await getAvaProject();
    const jsonPreHtml = '<pre>' + JSON.stringify(avaProject, null, 4) + '</pre>';
    setHtmlResult(jsonPreHtml);
}

// This function sends the GAEB file to AVACloud and returns the project model
function getAvaProject() {
    const apiClient = new DanglAVACloudClient.GaebConversionApi();
    var fileName = $('#gaebFile')[0].files[0];
    var opts = {
        gaebFile: fileName,
        myOp: true
    };

    const avaConversion = new Promise(function (resolve, reject) {
        var callback = function (error, data, response) {
            if (error) {
                alert('Failed to convert the GAEB input file');
                console.error(error);
                reject(error);
            } else {
                resolve(data);
            }
        };
        apiClient.gaebConversionConvertToAva(opts, callback);
    });

    return avaConversion;
}

function setHtmlResult(htmlResultContent) {
    $('#resultContainer').html(htmlResultContent);
}

$(document).ready(() => {
    $('#getTokenButton').click(() => {
        const clientId = $('#clientId').val();
        const clientSecret = $('#clientSecret').val();
        getAccessToken(clientId, clientSecret, '#accessToken');
    });

    $('#conversionButton').click(() => {
        const defaultClient = DanglAVACloudClient.ApiClient.instance;
        if (customAvaCloudBaseUrl) {
            defaultClient.basePath = customAvaCloudBaseUrl;
        }

        // Setting the access token for the API clients
        var danglIdentityAuth = defaultClient.authentications['Dangl.Identity'];
        danglIdentityAuth.accessToken = globalAccessToken;

        const selectedAction = $('input[name=conversionAction]:checked').val();
        if (selectedAction === 'listAllPositions') {
            listAllPositions();
        } else if (selectedAction === 'convertToJson') {
            convertToJson();
        }
    });

    $('#createNewFileButton').click(() => {
        const defaultClient = DanglAVACloudClient.ApiClient.instance;
        if (customAvaCloudBaseUrl) {
            defaultClient.basePath = customAvaCloudBaseUrl;
        }

        // Setting the access token for the API clients
        var danglIdentityAuth = defaultClient.authentications['Dangl.Identity'];
        danglIdentityAuth.accessToken = globalAccessToken;
        createNewFile();
    });
})

async function createNewFile() {
    const gaebFile = await getNewGaebFile();
    const jsonPreHtml = '<pre>' + $('<div>').text(gaebFile).html() + '</pre>';
    setHtmlResult(jsonPreHtml);
};

function getNewGaebFile() {
    // This is the AVA Project that we are transforming to a GAEB file
    // It is very simple and contains only a single position
    // with the short text 'Concrete Wall'
    const avaProject = {
        serviceSpecifications: [
            {
                elements: [
                    {
                        elementTypeDiscriminator: 'PositionDto',
                        shortText: 'Concrete Wall',
                        unitTag: 'm²',
                        quantityComponents: [
                            {
                                formula: '10'
                            }
                        ],
                        priceComponents: [
                            {
                                values: [
                                    {
                                        formula: '80'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // In the options, we specify the conversion target to GAEB XML V3.2
    const opts = {
        destinationGaebType: 'GaebXml_V3_2'
    };

    const apiClient = new DanglAVACloudClient.AvaConversionApi();
    const gaebConversion = new Promise(function (resolve, reject) {
        var callback = function (error, data, response) {
            if (error) {
                alert('Failed to convert to a GAEB file');
                console.error(error);
                reject(error);
            } else {
                resolve(data);
            }
        };
        apiClient.avaConversionConvertToGaeb(avaProject, opts, callback);
    });

    return gaebConversion;
}
