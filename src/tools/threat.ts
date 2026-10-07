import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeOpCommand, getConfig, formatResponse, resolveTarget, isApiError } from "../api/client.js";
import { firewallName, deviceSerial } from "../schemas/panos.js";

export function registerThreatTools(server: McpServer) {
  server.tool(
    "get_wildfire_status",
    "[READ-ONLY] Retrieves WildFire cloud connection status and statistics. Executes: show wildfire status. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get Wildfire Status", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><wildfire><status></status></wildfire></show>", target, device_serial);
      return formatResponse(result);
    }
  );

  server.tool(
    "get_antivirus_version",
    "[READ-ONLY] Retrieves current antivirus, threat, and WildFire signature versions and release dates. Executes: show system info (extracts signature fields). Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get Antivirus Version", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><system><info></info></system></show>", target, device_serial);
      if (result.success && result.data?.system) {
        const system = result.data.system;
        result.data = {
          "av-version": system["av-version"],
          "av-release-date": system["av-release-date"],
          "threat-version": system["threat-version"],
          "threat-release-date": system["threat-release-date"],
          "wildfire-version": system["wildfire-version"],
          "wildfire-release-date": system["wildfire-release-date"],
        };
      }
      return formatResponse(result);
    }
  );

  server.tool(
    "get_content_versions",
    "[READ-ONLY] Retrieves available content update versions (antivirus, applications, threats). Executes: request content upgrade info. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get Content Versions", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<request><content><upgrade><info></info></upgrade></content></request>", target, device_serial);
      return formatResponse(result);
    }
  );

  server.tool(
    "get_url_categories",
    "[READ-ONLY] Retrieves predefined URL filtering categories. Reads config at: /config/predefined/pan-url-categories.",
    {
      firewall: firewallName,
    },
    { title: "Get URL Categories", readOnlyHint: true, destructiveHint: false },
    async ({ firewall }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await getConfig("/config/predefined/pan-url-categories", target);
      return formatResponse(result);
    }
  );
}
