import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Building2, TrendingDown, TrendingUp, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import { mockCompanies, mockEvents, mockClaims, getImpactScoreColor, getGreenwashStatus, getSeverityColor } from '@/data/mockData';
import { format } from 'date-fns';

// Mock timeline data for companies
const getCompanyTimeline = (companyId: string) => {
  const baseScore = mockCompanies.find(c => c.id === companyId)?.latestImpactScore || 0;
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    score: baseScore + (Math.random() - 0.5) * 2
  }));
};

export default function Companies() {
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0]);

  const companyEvents = mockEvents.filter(e => e.linkedCompanyId === selectedCompany.id);
  const companyClaims = mockClaims.filter(c => c.companyId === selectedCompany.id);
  const timelineData = getCompanyTimeline(selectedCompany.id);
  const greenwashStatus = getGreenwashStatus(selectedCompany.latestGreenwashScore);

  // Mock contradictions analysis
  const contradictions = companyClaims.map(claim => {
    const relatedEvents = companyEvents.filter(e => 
      e.category === 'carbon_emissions' && claim.claimType === 'net_zero' ||
      e.category === 'deforestation' && claim.claimType === 'sustainability'
    );
    return {
      claim,
      contradictingEvents: relatedEvents,
      riskScore: relatedEvents.length > 0 ? 0.7 : 0.2,
      rationale: relatedEvents.length > 0 
        ? `Company claims ${claim.claimType} but recent events show contradictory evidence.`
        : 'No significant contradictions found with recent events.'
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company ESG Profiles</h1>
          <p className="text-muted-foreground">Detailed analysis of corporate environmental impact</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Company List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Companies
            </CardTitle>
            <CardDescription>Select a company to analyze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockCompanies.map((company) => (
              <Button
                key={company.id}
                variant={selectedCompany.id === company.id ? "default" : "ghost"}
                className="w-full justify-start p-4 h-auto"
                onClick={() => setSelectedCompany(company)}
              >
                <div className="text-left">
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs opacity-60">{company.sector}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${getImpactScoreColor(company.latestImpactScore)}`}>
                      {company.latestImpactScore > 0 ? '+' : ''}{company.latestImpactScore.toFixed(1)}
                    </span>
                    <Badge variant="outline" className={`text-xs ${greenwashStatus.className}`}>
                      {(company.latestGreenwashScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Company Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Company Header */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-foreground">{selectedCompany.name}</h2>
                    <Badge variant="secondary">{selectedCompany.sector}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedCompany.hqCountry}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{selectedCompany.description}</p>
                  {selectedCompany.website && (
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit Website
                    </Button>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <div className={`text-3xl font-bold ${getImpactScoreColor(selectedCompany.latestImpactScore)}`}>
                      {selectedCompany.latestImpactScore > 0 ? '+' : ''}{selectedCompany.latestImpactScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Impact Score</div>
                  </div>
                  <div>
                    <Badge className={greenwashStatus.className}>
                      {greenwashStatus.label}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(selectedCompany.latestGreenwashScore * 100).toFixed(0)}% Risk
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Timeline */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Impact Score Timeline</CardTitle>
              <CardDescription>30-day environmental impact trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    formatter={(value) => [`${Number(value).toFixed(1)}`, 'Impact Score']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs defaultValue="events" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Recent Events ({companyEvents.length})</TabsTrigger>
              <TabsTrigger value="claims">ESG Claims ({companyClaims.length})</TabsTrigger>
              <TabsTrigger value="contradictions">Analysis ({contradictions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              {companyEvents.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recent events</h3>
                    <p className="text-muted-foreground text-center">
                      No ESG events found for this company in our monitoring period.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                companyEvents.map((event) => (
                  <Card key={event.id} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={getSeverityColor(event.severity)}>
                              Severity {event.severity}
                            </Badge>
                            <Badge variant="secondary">
                              {event.category.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {event.sourceType}
                            </Badge>
                          </div>
                          <h4 className="font-semibold mb-2">{event.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{event.body}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{format(new Date(event.timestamp), 'MMM dd, yyyy')}</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getImpactScoreColor(event.impactScore)}`}>
                            {event.impactScore > 0 ? '+' : ''}{event.impactScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">Impact</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="claims" className="space-y-4">
              {companyClaims.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No ESG claims</h3>
                    <p className="text-muted-foreground text-center">
                      No documented ESG claims found for this company.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                companyClaims.map((claim) => (
                  <Card key={claim.id} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">
                              {claim.claimType.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={claim.verificationScore > 0.5 ? 'text-success border-success/30 bg-success/10' : 'text-warning-foreground border-warning/30 bg-warning/10'}>
                              {(claim.verificationScore * 100).toFixed(0)}% Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mb-3">{claim.claimText}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{format(new Date(claim.claimDate), 'MMM dd, yyyy')}</span>
                            <span>Sources: {claim.sources.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="contradictions" className="space-y-4">
              {contradictions.map((analysis, index) => (
                <Card key={index} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">ESG Claim Analysis</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            "{analysis.claim.claimText}"
                          </p>
                        </div>
                        <Badge className={analysis.riskScore > 0.5 ? 'greenwash-detected' : 'greenwash-clean'}>
                          {analysis.riskScore > 0.5 ? 'High Risk' : 'Low Risk'}
                        </Badge>
                      </div>

                      <div className="border-t border-border pt-4">
                        <h5 className="font-medium mb-2">Analysis Result</h5>
                        <p className="text-sm text-muted-foreground mb-3">{analysis.rationale}</p>
                        
                        {analysis.contradictingEvents.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium mb-2">Contradicting Events:</h6>
                            <div className="space-y-2">
                              {analysis.contradictingEvents.slice(0, 2).map((event) => (
                                <div key={event.id} className="text-sm p-3 bg-muted/50 rounded-lg">
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-muted-foreground">{format(new Date(event.timestamp), 'MMM dd, yyyy')}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}