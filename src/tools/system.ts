import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeOpCommand, formatResponse, resolveTarget, isApiError } from "../api/client.js";
import { firewallName, deviceSerial } from "../schemas/panos.js";

export function registerSystemTools(server: McpServer) {
  server.tool(
    "get_firewall_info",
    "[READ-ONLY] Retrieves system information (hostname, model, serial, software version) from the PanOS firewall. Executes: show system info. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get Firewall Info", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><system><info></info></system></show>", target, device_serial);
      if (result.success && result.data?.system) {
        result.data = result.data.system;
      }
      return formatResponse(result);
    }
  );

  server.tool(
    "get_ha_status",
    "[READ-ONLY] Retrieves high-availability (HA) state and peer information from the firewall. Executes: show high-availability state. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get HA Status", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><high-availability><state></state></high-availability></show>", target, device_serial);
      return formatResponse(result);
    }
  );

  server.tool(
    "get_active_sessions",
    "[READ-ONLY] Retrieves active session count and summary from the firewall. Executes: show session info. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get Active Sessions", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><session><info></info></session></show>", target, device_serial);
      return formatResponse(result);
    }
  );

  server.tool(
    "get_system_resources",
    "[READ-ONLY] Retrieves system resource utilization including CPU, memory, and disk usage. Executes: show system resources. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get System Resources", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><system><resources></resources></system></show>", target, device_serial);
      return formatResponse(result);
    }
  );
}
