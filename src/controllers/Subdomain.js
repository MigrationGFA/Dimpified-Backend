const { ClientSecretCredential } = require("@azure/identity");
const { DnsManagementClient } = require("@azure/arm-dns");

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.AZURE_RESOURCE_GROUP;
const zoneName = process.env.AZURE_ZONE_NAME;

// to fix domain creation
const createSubdomain = async (req, res) => {
    try {
        const subdomain = req.params.subdomain;

        const credential = new ClientSecretCredential(
            process.env.TENANT_ID, 
            process.env.CLIENT_ID, 
            process.env.VALUE 
        );
        const client = new DnsManagementClient(credential, subscriptionId);

        const parameters = {
            ttl: 3600,
            aRecords: [{ ipv4Address: process.env.AZURE_IP_ADDRESS }]
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


module.exports = createSubdomain