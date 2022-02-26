import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { BreadcrumbService } from '../../breadcrumb/breadcrumb.service';
import { ClassService } from '../../class/class.service';
import { FacetService } from '../facet.service';
import { RangeService } from '../../range/range.service';
import { Class } from '../../class/class';
import { Facet } from '../facet';
import { Description } from '../../description/description';
import { Filter } from '../../breadcrumb/filter';
import { catchError, takeUntil } from 'rxjs/operators';
import { Value } from '../../description/value';
//---------------------------------------------------
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';




@Component({
  selector: 'app-list-facet',
  templateUrl: './list-facet.component.html',
  styleUrls: ['./list-facet.component.css']
})
export class ListFacetComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  datasetId: string;
  classId: string;
  facets: Facet[] = [];
  retrievedFacets;
  relevance = 0.2;
  totalInstances = 0;
  filteredInstances;
  page = 1;
  pageSize = 50;
  datasetClass: Class = new Class();
  resources: Description[] = [];
  anonResources: Map<string, Description> = new Map<string, Description>();
  labels: Map<string, Value> = new Map<string, Value>();
  showFacets: boolean;
  showCharts: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private classService: ClassService,
    private facetService: FacetService,
    private rangeService: RangeService,
    private http        : HttpClient) {
  }

  ngOnInit() {
    this.datasetId = this.route.snapshot.paramMap.get('did') || 'default';
    this.classId = this.route.snapshot.paramMap.get('cid');
    console.log(this.datasetId);
    console.log(this.classId);
    this.refreshFacets(this.relevance, this.route.snapshot.queryParamMap);

  }

  refreshFacets(relevance: number, params: ParamMap) {
    if (params.keys.length) {
      relevance = 0;
    }
    this.facetService.getAllRelevant(this.datasetId, this.classId, relevance).subscribe(
      (facets: Facet[]) => {
        this.facets = facets.sort((a, b) => a.label.localeCompare(b.label));
        this.retrievedFacets = facets.length;
        this.loadFacetClass();
        forkJoin(this.facets.map(facet =>
            this.rangeService.getAll(this.datasetId, this.classId, facet.curie))).subscribe(
            facetsRanges => {
              facetsRanges.map((ranges, i) => this.facets[i].ranges = ranges);
              const paramFilters = Filter.fromParam(this.classId, this.facets, params);
              paramFilters.forEach((filter: Filter) => {
                if (!filter.value) {
                  filter.facet.selected = true;
                } else {
                  filter.range.expanded = true;
                }
              });
              this.breadcrumbService.addFacetFilters(paramFilters);
              this.breadcrumbService.filtersSelection.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
                (filters: Filter[]) => this.refreshInstances(this.datasetId, this.classId, filters));
            }
        );
      }, () => this.router.navigate(['..'], {relativeTo: this.route}));
  }

  loadFacetClass() {
    this.classService.get(this.datasetId, this.classId).subscribe(
      (datasetClass: Class) => {
        this.datasetClass = datasetClass;
        this.totalInstances = datasetClass.instanceCount;
      });
  }

  refreshInstances(datasetId: string, classId: string, filters: Filter[]) {
    this.filteredInstances = undefined;
    this.resources = undefined;
    this.page = 1;
    window.scrollTo(0, 0);
    this.classService.getInstancesCount(datasetId, classId, filters).subscribe(
      count => {
        this.filteredInstances = count;
        this.loadInstances(datasetId, classId, filters, this.page);
      });
  }

  loadInstances(datasetId: string, classId: string, filters: Filter[], page: number) {
    console.log(datasetId);
    console.log(classId);
    console.log(filters);
    console.log("SSSSS");
    console.log(page);
    console.log(this.page);

    forkJoin([
      this.classService.getInstances(datasetId, classId, filters, page, this.pageSize).pipe(
        catchError(err => of({})),
      ),
      this.classService.getInstancesLabels(datasetId, classId, filters, page, this.pageSize).pipe(
        catchError(err => of({})),
      ) ])
      .subscribe(
        ([instances, labels]) => {
          const linkedResourcesLabels: Map<string, Value> = Description.getLabels(labels);
          this.labels = new Map([...linkedResourcesLabels, ...Description.getLabels(instances)]);
          if (instances['@graph']) {
            this.anonResources = Description.getAnonResources(instances, this.labels);
            this.resources =  Description.getResourcesOfType(instances, this.datasetClass.uri, this.labels);
          } else if (instances['@type']) {
            this.resources = [new Description(instances, instances['@context'], this.labels)];
          } else {
            this.resources = [];
          }
          console.log(this.resources[0].asJsonLd());
          console.log(this.resources.length);
          this.sortResource();
        });

        this.isChartCompatible(filters);
  }

  isChartCompatible(filters: Filter[]){
    var did = "datasetvisible2";
    //We check if there is a numerical Observation/observation
    var observation = this.classId.includes("bservation");
    this.showCharts = observation;


    var page = 1;
    console.log("Prova GET");
    let params = new HttpParams();
    params = params.append('page', (page - 1).toString());
    params = params.append('size', this.pageSize.toString());
    filters.forEach((filter: Filter) =>
      params = params.append(filter.facet.uri + (filter.range ? ' ' + filter.range.uri : ''), filter.value));
    var x = this.http.get<any>(
      "https://rhizomer-api.dev.rhizomik.net/datasets/datasetvisible2/describe?uri=http://example.org/macroeconomicdata%23AT-2005",
       {params: params});
    
       console.log(x);


  }

  isGeoCompatible(){
      //return this.isChartCompatible() 
  }

  goToPage(page: number) {
    window.scrollTo(0, 0);
    this.resources = undefined;
    this.loadInstances(this.datasetId, this.classId, this.breadcrumbService.filters, page);
  }

  loadAllFacets() {
    this.refreshFacets(0, Filter.toParamMap(this.breadcrumbService.filters));
  }

  private sortResource() {
    this.resources.sort((a, b) => {
      if (a.label && b.label) {
        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
      } else if (!a.label && b.label) {
        return -1;
      } else if (a.label && !b.label) {
        return 1;
      } else {
        return a['@id'].localeCompare(b['@id']);
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.breadcrumbService.clearFilter();
  }
}
