<#--
  List mode (AD_PrintTemplate.IsForm = 'N'): rendered once over the filtered records.
  Replace every {{placeholder}} and every r.<Column> with real column names from
  AD_Column of the target table. Values are HTML-escaped automatically (.ftlh).
-->
<style>
  body    { font-family: sans-serif; font-size: 10pt; }
  .meta   { color: #555; margin-bottom: 1em; }
  table   { border-collapse: collapse; width: 100%; }
  th, td  { border-bottom: 1px solid #ddd; padding: 4px 6px; text-align: left; }
  .amount { text-align: right; white-space: nowrap; }
  .total  { font-weight: bold; border-top: 2px solid #333; }
</style>

<h1>{{Report title}}</h1>
<p class="meta">
  ${ctx.client_name!""} — ${(ctx.now?string("yyyy-MM-dd HH:mm"))!""} — ${count} record(s)
</p>

<#-- FreeMarker has no sum over a list of maps: accumulate in a variable. -->
<#assign total = 0>

<#if count == 0>
  <p>No records match the selected filter.</p>
<#else>
<table>
  <thead>
    <tr>
      <th>{{Document no.}}</th>
      <th>{{Business partner}}</th>
      <th class="amount">{{Amount}}</th>
    </tr>
  </thead>
  <tbody>
  <#list rows as r>
    <tr>
      <td>${r.DocumentNo!"-"}</td>
      <#-- Foreign keys arrive as {id, display}. -->
      <td>${(r.C_BPartner_ID.display)!"-"}</td>
      <td class="amount">${(r.GrandTotal?string["#,##0.00"])!"-"}</td>
    </tr>
    <#assign total = total + (r.GrandTotal!0)>
  </#list>
  </tbody>
  <tfoot>
    <tr class="total">
      <td colspan="2">Total</td>
      <td class="amount">${total?string["#,##0.00"]}</td>
    </tr>
  </tfoot>
</table>
</#if>
