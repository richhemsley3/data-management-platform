# Software DS — QA Test Checklist

## State Testing Matrix

For every interactive component, verify all states render correctly:

### Button States
| State | Primary | Secondary | Tertiary | Danger | Danger Outline |
|-------|---------|-----------|----------|--------|----------------|
| Default | blue-750 bg, white text | white bg, warm-gray-800 border | transparent, blue-750 text | red-500 bg, white text | white bg, red-500 border |
| Hover | blue-800 bg | warm-gray-050 bg, warm-gray-900 border | warm-gray-050 bg | red-600 bg | red-025 bg |
| Active | blue-850 bg | warm-gray-100 bg | warm-gray-100 bg | red-650 bg | red-050 bg |
| Focus | 2px blue-750 outline | 2px blue-750 outline | 2px blue-750 outline | 2px blue-750 outline | 2px blue-750 outline |
| Disabled | #CACCCF bg, white text | white bg, warm-gray-200 border, warm-gray-300 text | transparent, warm-gray-300 text | #CACCCF bg | — |

### Navigation Item States
| State | Background | Text Color | Icon Stroke | Font Weight |
|-------|------------|------------|-------------|-------------|
| Default | transparent | warm-gray-700 (#47443F) | warm-gray-550 (#6B6760) | 400 |
| Hover | warm-gray-050 (#F4F1EB) | warm-gray-900 (#1C1A17) | warm-gray-700 (#47443F) | 400 |
| Active | blue-100 (#D9EBED) | blue-750 (#013D5B) | blue-750 (#013D5B) | 500 |
| Active+Hover | blue-150 (#C1DDE3) | blue-750 (#013D5B) | blue-750 (#013D5B) | 500 |

### Form Input States
| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | warm-gray-150 | white | warm-gray-900 |
| Focus | blue-750 (2px) | white | warm-gray-900 |
| Error | red-500 | white or red-025 | warm-gray-900 |
| Disabled | warm-gray-100 | warm-gray-025 | warm-gray-300 |
| Placeholder | — | — | warm-gray-550 |

## Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Desktop (default) | 1280px+ | Full sidebar (220px) + content |
| Tablet | 768px–1279px | Collapsed sidebar (56px) + content |
| Mobile | < 768px | Hidden sidebar, hamburger menu, stacked layout |

### Responsive Checks
- [ ] Sidebar collapses correctly at tablet breakpoint
- [ ] Content area fills available space when sidebar collapses
- [ ] Tables scroll horizontally on mobile, or switch to card layout
- [ ] Touch targets are minimum 44×44px on mobile
- [ ] Modals are full-screen on mobile
- [ ] Font sizes remain readable at all breakpoints

## Browser Testing Matrix

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 versions | P1 |
| Firefox | Latest 2 versions | P1 |
| Safari | Latest 2 versions | P1 |
| Edge | Latest 2 versions | P2 |
| Safari iOS | Latest 2 versions | P2 |
| Chrome Android | Latest 2 versions | P3 |

### Cross-Browser Checks
- [ ] CSS custom properties (var()) render correctly
- [ ] Flexbox/grid layouts consistent
- [ ] Transitions and animations smooth
- [ ] SVG icons render correctly
- [ ] Font rendering consistent (system font stack)
- [ ] Focus-visible behavior correct (not on click, only keyboard)

## Dark Mode Testing

- [ ] `prefers-color-scheme: dark` triggers correctly
- [ ] All semantic tokens switch to dark mode values
- [ ] Text remains readable on dark backgrounds
- [ ] Borders visible on dark backgrounds (cool-gray-750)
- [ ] Status colors maintain contrast in dark mode
- [ ] Images/SVGs visible on dark backgrounds
- [ ] No hardcoded colors that break in dark mode

## Edge Case Testing

### Data Edge Cases
| Scenario | What to Check |
|----------|---------------|
| Empty state | Empty state message shows with CTA |
| Single item | Layout works with 1 row/card |
| Maximum items | Pagination/virtual scroll handles 1000+ items |
| Long text | Text truncates with ellipsis, tooltips show full text |
| Special characters | `<script>`, `"quotes"`, `émojis`, RTL text display correctly |
| Missing data | Null/undefined fields show dash or "—", not "undefined" |

### Interaction Edge Cases
| Scenario | What to Check |
|----------|---------------|
| Rapid clicks | Double-submit prevented on forms/buttons |
| Concurrent edits | Conflict resolution or last-write-wins with notification |
| Browser back | State preserved or gracefully handled |
| Tab away and back | No stale data, refresh or revalidate |
| Network error mid-action | Error toast with retry option |
| Session timeout | Redirect to login with return URL |

### Layout Edge Cases
| Scenario | What to Check |
|----------|---------------|
| Narrow viewport | No horizontal overflow on body |
| Very wide viewport | Content max-width prevents ultra-wide stretch |
| Zoom 200% | No overlapping elements, all text readable |
| Print | Print stylesheet hides nav, formats content |

## Test Report Format

```markdown
## QA Report: [Component/Page Name]
Date: [Date]

### Summary
| Category | Pass | Fail | Blocked |
|----------|------|------|---------|
| Functional | X | Y | Z |
| Visual | X | Y | Z |
| Edge Cases | X | Y | Z |
| Responsive | X | Y | Z |
| Dark Mode | X | Y | Z |
| Cross-Browser | X | Y | Z |

### Failures
| # | Category | Severity | Description | Steps to Reproduce | Expected | Actual |
|---|----------|----------|-------------|---------------------|----------|--------|
| 1 | Visual | P1 | Description | Steps | Expected | Actual |

### Recommendations
1. [P1 fix]
2. [P2 fix]

### Notes
[Observations, patterns, suggestions]
```

## DMP Test Scenarios

### Connections
| Scenario | Test Steps | Expected Result |
|----------|-----------|-----------------|
| Add Snowflake connection | Wizard → select Snowflake → enter credentials → test → select schemas → save | Connection appears in list with "Active" badge |
| Add AWS S3 connection | Wizard → select AWS → enter IAM credentials → test → select buckets → save | Connection with S3 icon and "Active" badge |
| Connection test failure | Enter invalid credentials → click Test | Error message with specific failure reason |
| Edit connection | Connection detail → Settings tab → modify → save | Changes reflected, no scan disruption |
| Delete connection | Connection detail → Delete → confirm | Connection removed, associated scans removed from history |

### Classification
| Scenario | Test Steps | Expected Result |
|----------|-----------|-----------------|
| Accept suggested classification | Table detail → click Accept on PII suggestion | Status changes to "Confirmed", confidence hidden |
| Override classification | Table detail → click Override → select different type → save | New classification shown, "Overridden" indicator |
| Reject classification | Table detail → click Reject | Classification removed, column shows "No classification" |
| Bulk accept | Select multiple columns → Bulk Accept | All selected change to "Confirmed" |
| Re-scan persistence | Run new scan on previously classified connection | Confirmed classifications persist, new suggestions for new columns |

### Risk Score
| Scenario | Test Steps | Expected Result |
|----------|-----------|-----------------|
| Score after first scan | Complete scan with sensitive data detected | Risk score > 0, appears on dashboard |
| Score decreases after remediation | Apply tokenization to high-risk columns | Score decreases, trend chart shows improvement |
| Score color thresholds | View scores at 20, 40, 65, 85 | Green, yellow, orange/red, red respectively |

### Remediation
| Scenario | Test Steps | Expected Result |
|----------|-----------|-----------------|
| Tokenize columns | Select columns → Tokenize → preview → confirm | Data tokenized, status = "Protected" |
| Rollback tokenization | Remediation history → select tokenization → Rollback | Data restored, risk score increases |
| Revoke access | Select column → Revoke access → confirm | Access removed, audit log entry |
| Delete data | Select rows → Delete → type confirmation → execute | Data deleted, irreversible warning shown |

### Dashboard
| Scenario | Test Steps | Expected Result |
|----------|-----------|-----------------|
| Empty dashboard | New account, no connections | Empty state with "Add connection" CTA |
| Drill-down to catalog | Click protection coverage donut | Navigates to Data Catalog |
| Drill-down to remediation | Click "Remediate" on a risk item | Navigates to Remediation with pre-selected data |
| Metrics refresh | Complete remediation → return to dashboard | Score updated, coverage changed |
