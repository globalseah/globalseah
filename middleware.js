import { next } from "@vercel/edge";

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};

function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Global Seah Admin", charset="UTF-8"',
    },
  });
}

export default function middleware(request) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminUser || !adminPass) {
    return new Response("Admin authentication is not configured.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) return unauthorized();

  const [scheme, encoded] = authorization.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator === -1) return unauthorized();

  const user = decoded.slice(0, separator);
  const pass = decoded.slice(separator + 1);

  if (user !== adminUser || pass !== adminPass) {
    return unauthorized();
  }

  return next();
}
