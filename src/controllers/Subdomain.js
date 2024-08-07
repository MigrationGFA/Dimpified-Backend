// const { DefaultAzureCredential } = require("@azure/identity");
// const { DnsManagementClient } = require("@azure/arm-dns");
const { ClientSecretCredential } = require("@azure/identity");
const { DnsManagementClient } = require("@azure/arm-dns");

const subscriptionId = "25d8e50c-30be-465f-887d-78a72103aaf4";
const resourceGroupName = "GFA-WEMA";
const zoneName = "dimpified.com";

const createSubdomain = async (req, res) => {
    try {
        const subdomain = req.params.subdomain;

        const credential = new ClientSecretCredential(
            "6ae6f711-0008-4a2d-899f-15cc3239c809", // AZURE_TENANT_ID
            "8df07449-b5a2-499d-8b5e-cfec901ed508", // AZURE_CLIENT_ID
            "zKX8Q~~rQqkvys5WA1Fl0IpgSaM2posjjlLI5dtG" // AZURE_CLIENT_SECRET
        );
        const client = new DnsManagementClient(credential, subscriptionId);

        const parameters = {
            ttl: 3600,
            aRecords: [{ ipv4Address: "13.80.179.118" }]
        };

        await client.recordSets.createOrUpdate(
            resourceGroupName,
            zoneName,
            subdomain,
            "A",
            parameters
        );

        console.log(`Subdomain ${subdomain}.${zoneName} created successfully!`);
        res.status(200).json({ message: `Subdomain ${subdomain}.${zoneName} created successfully!` });
    } catch (error) {
        console.error("Error creating subdomain:", error);
        res.status(500).json({ error: 'Failed to create subdomain' });
    }
};

// const createSubdomain = async (req, res) => {
//     try {
//          const subdomain = req.params.subdomain
//     const credential = new DefaultAzureCredential();
//     const client = new DnsManagementClient(credential, subscriptionId);

//   const parameters = {
//     ttl: 3600,
//     aRecords: [{ ipv4Address: "your-ip-address" }]
//   };

//   await client.recordSets.createOrUpdate(
//     resourceGroupName,
//     zoneName,
//     subdomain,
//     "A",
//     parameters
//   );

//   console.log(`Subdomain ${subdomain}.${zoneName} created successfully!`);
//     } catch (error) {
//         console.log("error creating subdomain:", error)
//         res.status(500).json({ error: 'Failed to fetch creator' });
//     }
   
// };

// createSubdomain().catch(err => console.error("Error creating subdomain:", err));

module.exports = createSubdomain