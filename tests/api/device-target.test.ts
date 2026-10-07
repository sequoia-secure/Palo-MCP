import { describe, it, expect } from "vitest";
import { opCommandUrl } from "../../src/api/client.js";
import { deviceSerial } from "../../src/schemas/panos.js";
import { registerNetworkTools } from "../../src/tools/network.js";
import { registerSystemTools } from "../../src/tools/system.js";
import { registerLicensesTools } from "../../src/tools/licenses.js";
import { registerThreatTools } from "../../src/tools/threat.js";
import { registerUserIdTools } from "../../src/tools/userid.js";
import { registerVpnTools } from "../../src/tools/vpn.js";

// Panorama runs an operational command on a managed firewall when the request
// carries `target=<serial>`. The serial is caller-supplied and lands in the URL,
// so it must not be able to add or override other API parameters.

describe("opCommandUrl", () => {
  const CMD = "<show><interface>all</interface></show>";

  it("leaves the request untargeted without a serial", () => {
    expect(opCommandUrl("panorama.example", CMD)).toBe(
      `https://panorama.example/api/?type=op&cmd=${encodeURIComponent(CMD)}`
    );
  });

  it("adds target=<serial> for a managed firewall", () => {
    const url = new URL(opCommandUrl("panorama.example", CMD, "12001062269"));
    expect(url.searchParams.get("type")).toBe("op");
    expect(url.searchParams.get("cmd")).toBe(CMD);
    expect(url.searchParams.get("target")).toBe("12001062269");
  });

  it("encodes the serial so it cannot add parameters", () => {
    const url = new URL(opCommandUrl("panorama.example", CMD, "1&type=config"));
    expect(url.searchParams.get("type")).toBe("op");
    expect(url.searchParams.get("target")).toBe("1&type=config");
  });
});

describe("deviceSerial schema", () => {
  it.each(["12001062269", "7955000548555", "007951000123456", "PA0123ABC"])("accepts %s", (serial) => {
    expect(deviceSerial.safeParse(serial).success).toBe(true);
  });

  it("is optional", () => {
    expect(deviceSerial.safeParse(undefined).success).toBe(true);
  });

  it.each(["", "1&type=config", "123 456", "../etc", "<show/>", "a".repeat(33)])("rejects %j", (serial) => {
    expect(deviceSerial.safeParse(serial).success).toBe(false);
  });
});

type Registered = { name: string; schema: Record<string, unknown>; annotations: { readOnlyHint?: boolean } };

function registeredTools(): Registered[] {
  const tools: Registered[] = [];
  const server = {
    tool: (name: string, _desc: string, schema: Record<string, unknown>, annotations: Registered["annotations"]) => {
      tools.push({ name, schema, annotations });
    },
  };
  for (const register of [
    registerNetworkTools, registerSystemTools, registerLicensesTools,
    registerThreatTools, registerUserIdTools, registerVpnTools,
  ]) {
    register(server as never);
  }
  return tools;
}

describe("device_serial tools", () => {
  const tools = registeredTools();
  const targeted = tools.filter((t) => "device_serial" in t.schema).map((t) => t.name).sort();

  it("is offered on exactly the read-only firewall operational tools", () => {
    expect(targeted).toEqual([
      "get_active_sessions", "get_antivirus_version", "get_arp_table", "get_content_versions",
      "get_dhcp_leases", "get_firewall_info", "get_globalprotect_users", "get_ha_status",
      "get_interfaces", "get_ipsec_tunnels", "get_license_usage", "get_licenses",
      "get_routing_table", "get_system_resources", "get_userid_groups", "get_userid_mappings",
      "get_wildfire_status",
    ]);
  });

  it("is never offered on a tool that changes configuration", () => {
    const writes = tools.filter((t) => "device_serial" in t.schema && t.annotations.readOnlyHint !== true);
    expect(writes.map((t) => t.name)).toEqual([]);
  });
});
