const { DefaultAzureCredential } = require("@azure/identity");
const { DnsManagementClient } = require("@azure/arm-dns");

const subscriptionId = "25d8e50c-30be-465f-887d-78a72103aaf4";
const resourceGroupName = "GFA-WEMA";
const zoneName = "dimpified.com";


const createSubdomain = async (req, res) => {
    try {
         const subdomain = req.params.subdomain
    const credential = new DefaultAzureCredential();
    const client = new DnsManagementClient(credential, subscriptionId);

  const parameters = {
    ttl: 3600,
    aRecords: [{ ipv4Address: "your-ip-address" }]
  };

  await client.recordSets.createOrUpdate(
    resourceGroupName,
    zoneName,
    subdomain,
    "A",
    parameters
  );

  console.log(`Subdomain ${subdomain}.${zoneName} created successfully!`);
    } catch (error) {
        console.log("error creating subdomain:", error)
        res.status(500).json({ error: 'Failed to fetch creator' });
    }
   
};

// createSubdomain().catch(err => console.error("Error creating subdomain:", err));

module.exports = createSubdomain