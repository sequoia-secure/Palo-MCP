import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeOpCommand, getConfig, formatResponse, resolveTarget, isApiError } from "../api/client.js";
import { firewallName, deviceSerial } from "../schemas/panos.js";

export function registerVpnTools(server: McpServer) {
  server.tool(
    "get_ipsec_tunnels",
    "[READ-ONLY] Retrieves IPSec VPN tunnel status and security associations. Executes: show vpn ipsec-sa. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get IPSec Tunnels", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><vpn><ipsec-sa></ipsec-sa></vpn></show>", target, device_serial);
      return formatResponse(result);
    }
  );

  server.tool(
    "get_globalprotect_users",
    "[READ-ONLY] Retrieves currently connected GlobalProtect VPN users. Executes: show global-protect-gateway current-user. Set device_serial to run it on a Panorama-managed firewall.",
    {
      firewall: firewallName,
      device_serial: deviceSerial,
    },
    { title: "Get GlobalProtect Users", readOnlyHint: true, destructiveHint: false },
    async ({ firewall, device_serial }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await executeOpCommand("<show><global-protect-gateway><current-user></current-user></global-protect-gateway></show>", target, device_serial);
      return formatResponse(result);
    }
  );

  server.tool(
    "get_globalprotect_config",
    "[READ-ONLY] Retrieves GlobalProtect gateway and portal configuration. Reads config at: /config/.../vsys/entry/global-protect.",
    {
      firewall: firewallName,
    },
    { title: "Get GlobalProtect Config", readOnlyHint: true, destructiveHint: false },
    async ({ firewall }) => {
      const target = resolveTarget(firewall);
      if (isApiError(target)) return formatResponse(target);
      const result = await getConfig("/config/devices/entry[@name='localhost.localdomain']/vsys/entry[@name='vsys1']/global-protect", target);
      return formatResponse(result);
    }
  );
}
