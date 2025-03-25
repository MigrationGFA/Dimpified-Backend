// const { ClientSecretCredential } = require("@azure/identity");
// const { DnsManagementClient } = require("@azure/arm-dns");
// const { WebSiteManagementClient } = require("@azure/arm-appservice");
// const { exec } = require("child_process");

// const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
// const resourceGroupName = process.env.AZURE_RESOURCE_GROUP;
// const zoneName = process.env.AZURE_ZONE_NAME;
// const appServiceName = process.env.AZURE_APP_SERVICE_NAME;



// const createSubdomain = async (subdomain) => {
//     try {
//         //  const subdomain = req.params.subdomain;
//         const fullDomain = `${subdomain}.${zoneName}`;
//         // Step 1: Create the CNAME record
//          const credential = new ClientSecretCredential(
//             process.env.TENANT_ID,
//             process.env.CLIENT_ID,
//             process.env.VALUE
//         );
//         const client = new DnsManagementClient(credential, subscriptionId);
//         const webClient = new WebSiteManagementClient(credential, subscriptionId);

//         const parameters = {
//             ttl: 3600,
//             cnameRecord: { cname: process.env.AZURE_CNAME }
//         };
//           await client.recordSets.createOrUpdate(
//                 resourceGroupName,
//                 zoneName,
//                 subdomain,
//                 "CNAME",
//                parameters
//             );
//         console.log(`CNAME record created for ${fullDomain}`);

//         // Step 2: Create Hostname Binding to get the TXT validation token
//        const hostnameBindingParameters = {
//                 hostnameBindingName: subdomain,
//             location: "Global",
//             siteName: appServiceName,
//             properties: {
//                 customHostNameDnsRecordType: "CName",
//                 hostNameType: "Verified",
//             }
//         };
//         console.log("this not get here")

//         let validationToken;
//         try {
//             console.log("enter the second try")
//             await webClient.webApps.createOrUpdateHostNameBinding(
//                 resourceGroupName,
//                 appServiceName,
//                 subdomain,
//                 hostnameBindingParameters
//             );
//         } catch (error) {
//             const match = error.details.Message.match(/asuid\.[^\s]+ to ([^\s]+)/)[1];
//             console.log("this is match", match)
//             if (match) {
//                 validationToken = match;
//                 console.log(`Validation token for ${fullDomain}: ${validationToken}`);
//             } else {
//                 throw new Error("Failed to extract validation token.");
//             }
//         }
//         // Step 3: Create the TXT record with the validation token
//         const txtRecordParameters = {
//             ttl: 3600,
//             txtRecords: [{ value: [validationToken] }]
//         };

//         await client.recordSets.createOrUpdate(
//             resourceGroupName,
//             zoneName,
//             `asuid.${subdomain}`,
//             "TXT",
//             txtRecordParameters
//         );
//         // Step 4: Validate the subdomain by retrying the hostname binding
//         console.log('Waiting for DNS propagation...');
//         await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
//         await webClient.webApps.createOrUpdateHostNameBinding(
//             resourceGroupName,
//             appServiceName,
//             fullDomain,
//             hostnameBindingParameters
//         );
//         return "Subdomain creation successful"
//     } catch (error) {
//         console.log("this is error", error)
//         console.error(`Error in automation: ${error.message}`);
//         throw error;
//     }
// };



// module.exports = createSubdomain


const { ClientSecretCredential } = require("@azure/identity");
const { DnsManagementClient } = require("@azure/arm-dns");
const { WebSiteManagementClient } = require("@azure/arm-appservice");

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.AZURE_RESOURCE_GROUP;
const zoneName = process.env.AZURE_ZONE_NAME;
const appServiceName = process.env.AZURE_APP_SERVICE_NAME;
const appServiceCNAME = process.env.AZURE_CNAME; 

const createSubdomain = async (subdomain) => {
    try {
        const fullDomain = `${subdomain}.${zoneName}`;

        // Initialize Azure Clients
        const credential = new ClientSecretCredential(
            process.env.TENANT_ID,
            process.env.CLIENT_ID,
            process.env.VALUE
        );
        const dnsClient = new DnsManagementClient(credential, subscriptionId);
        const webClient = new WebSiteManagementClient(credential, subscriptionId);

        // Step 1: Create Hostname Binding (to get TXT validation token)
        const hostnameBindingParams = {
            hostnameBindingName: subdomain,
            location: "Global",
            siteName: appServiceName,
            properties: {
                customHostNameDnsRecordType: "CName",
                hostNameType: "Verified",
            },
        };

        let validationToken;
        try {
            await webClient.webApps.createOrUpdateHostNameBinding(
                resourceGroupName,
                appServiceName,
                fullDomain,
                hostnameBindingParams
            );
        } catch (error) {
            const match = error.details?.Message?.match(/asuid\.[^\s]+ to ([^\s]+)/);
            console.log("this is match", match)
            if (match) {
                validationToken = match[1];
                console.log(`Validation token for ${fullDomain}: ${validationToken}`);
            } else {
                throw new Error("Failed to extract validation token.");
            }
        }

        // Step 2: Create the TXT record with the validation token
        const txtRecordParams = {
            ttl: 3600,
            txtRecords: [{ value: [validationToken] }],
        };

        await dnsClient.recordSets.createOrUpdate(
            resourceGroupName,
            zoneName,
            `asuid.${subdomain}`,
            "TXT",
            txtRecordParams
        );

        console.log(`TXT record created for asuid.${fullDomain}`);

        // Step 3: Wait for DNS propagation (Recommended: 1-2 minutes)
        console.log("Waiting for DNS propagation...");
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10-second delay

        // Step 4: Create the CNAME record
        const cnameRecordParams = {
            ttl: 3600,
            cnameRecord: { cname: appServiceCNAME },
        };

        await dnsClient.recordSets.createOrUpdate(
            resourceGroupName,
            zoneName,
            subdomain,
            "CNAME",
            cnameRecordParams
        );

        console.log(`CNAME record created for ${fullDomain}`);

        // Step 5: Re-attempt hostname binding for final validation
        await webClient.webApps.createOrUpdateHostNameBinding(
            resourceGroupName,
            appServiceName,
            fullDomain,
            hostnameBindingParams
        );

        console.log(`Subdomain ${fullDomain} successfully created and validated!`);
        return "Subdomain creation successful";
    } catch (error) {
        console.error("Error in automation:", error.message);
        throw error;
    }
};

module.exports = createSubdomain;
