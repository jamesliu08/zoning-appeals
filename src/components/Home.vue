<template>
  <div class="container">
    <div class="row">
      <div class="columns medium-8">
        <div class="card">
          <div class="card-section">
            <form>
              <h3 v-if="!hideSelect"><i class="fi-marker"></i> Regions</h3>
              <select v-if="!hideSelect" class="selectpicker region-picker" title="Select a region..." v-model="regionSelect" v-on:change="changeURL">
                <option value="all">All regions</option>
                <optgroup label="Council District">
                  <option value="cd:1">Council District 1</option>
                  <option value="cd:2">Council District 2</option>
                  <option value="cd:3">Council District 3</option>
                  <option value="cd:4">Council District 4</option>
                  <option value="cd:5">Council District 5</option>
                  <option value="cd:6">Council District 6</option>
                  <option value="cd:7">Council District 7</option>
                  <option value="cd:8">Council District 8</option>
                  <option value="cd:9">Council District 9</option>
                  <option value="cd:10">Council District 10</option>
                </optgroup>
                <optgroup label="Planning District">
                  <option value="planning:Central">Central</option>
                  <option value="planning:Central Northeast">Central Northeast</option>
                  <option value="planning:Lower Far Northeast">Lower Far Northeast</option>
                  <option value="planning:Lower North">Lower North</option>
                  <option value="planning:Lower Northeast">Lower Northeast</option>
                  <option value="planning:Lower Northwest">Lower Northwest</option>
                  <option value="planning:Lower South">Lower South</option>
                  <option value="planning:Lower Southwest">Lower Southwest</option>
                  <option value="planning:North">North</option>
                  <option value="planning:North Delaware">North Delaware</option>
                  <option value="planning:River Wards">River Wards</option>
                  <option value="planning:South">South</option>
                  <option value="planning:University/Southwest">University/Southwest</option>
                  <option value="planning:Upper Far Northeast">Upper Far Northeast</option>
                  <option value="planning:Upper North">Upper North</option>
                  <option value="planning:Upper Northwest">Upper Northwest</option>
                  <option value="planning:West">West</option>
                  <option value="planning:West Park">West Park</option>
                </optgroup>
                <optgroup label="RCO">
                  <option v-for="option in rcoArray" :key="option.attributes.ORGANIZATION_NAME" :value="`rco:${option.attributes.ORGANIZATION_NAME}`">
                    {{ option.attributes.ORGANIZATION_NAME }}
                  </option>
                </optgroup>
              </select>
              <div>
                <h3><i class="fi-calendar"></i> Date</h3>
                <div class="input-group">
                  <input class="input-group-field" id="dpd1" type="text" v-model="date1" ref="refDate1">
                  <span class="input-group-label">to</span>
                  <input class="input-group-field" id="dpd2" type="text" v-model="date2" ref="refDate2">
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="columns medium-16 text-center">
        <div class="card">
          <div class="card-divider">
            <h3 v-show="!loading">There are {{ rowsCount }} appeals from {{ displayDate1 }} to {{ displayDate2 }}</h3>
            <h3 v-show="loading">Fetching data...</h3>
          </div>
          <div class="card-section nopadding-xs">
            <custom-table v-on:rowClick="goToDetail" v-bind:enableRowClick="true" v-bind:allowLoadMore="true" v-bind:rows="localRows"
                v-bind:fields="['date', 'time', 'address', 'appealno']">
              <thead slot="head">
                <tr>
                  <th class="text-center">Date</th>
                  <th class="text-center">Time (EST)</th>
                  <th class="text-center">Address</th>
                  <th class="text-center">Appeal #</th>
                </tr>
              </thead>
            </custom-table>
          </div>
        </div>
      </div>
    </div>
    <modal v-if="showModal" @close="showModal = false" :message="modalMessage"></modal>
  </div>
</template>
<script type="text/javsacript">
  /**
   * Import Helpers
   */
  import * as moment from 'moment';
  import * as objects from '../assets/js/objects';
  import * as cache from '../assets/js/utils/cache';
  import * as queries from '../assets/js/queries';

  /**
   * Import components
   */
  import Table from './Table.vue';
  import Modal from './Modal.vue';
  global.$ = global.jQuery = require('jquery');
  require('../assets/js/utils/foundation-datepicker.js');

  const VALIDATE_URL_DATE_FORMAT = 'YYYY-M-D';
  const DATE_FORMAT = 'YYYY-MM-DD';
  const ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
  const homeStore = {
    date1: null,
    displayDate1: '',
    date2: null,
    displayDate2: '',
    rcoArray: [],
    datepicker1: null,
    datepicker2: null,
    localRows: [],
    rowsCount: 0,
    regionSelect: 'all',
    showModal: false,
    modalMessage: "",
    loading: true,
    hideSelect: false,
  };

  export default {
    name: 'Home',
    data() {
      return homeStore;
    },
    components: {
      'custom-table': Table,
      'modal': Modal
    },
    beforeMount() {
      this.hideSelect = (document.documentElement.className === 'lt-ie10');
      let forceURL = false;
      if (moment(this.$route.params.date1, VALIDATE_URL_DATE_FORMAT, true).isValid()) {
        this.date1 = moment(this.$route.params.date1, VALIDATE_URL_DATE_FORMAT).format(DATE_FORMAT);
      } else {
        // Wrong URL
        forceURL = true;
      }

      if (moment(this.$route.params.date2, VALIDATE_URL_DATE_FORMAT, true).isValid()) {
        this.date2 = moment(this.$route.params.date2, VALIDATE_URL_DATE_FORMAT).format(DATE_FORMAT);
      } else {
        // Wrong URL
        forceURL = true;
      }

      if (!this.date1) {
        this.date1 = moment().format(DATE_FORMAT);
      }

      if (!this.date2) {
        this.date2 = moment().add(6, 'months').format(DATE_FORMAT);
      }

      if (this.$route.params.region && this.$route.params.regionId) {
        this.regionSelect = `${this.$route.params.region}:${this.$route.params.regionId}`;
      }

      if (forceURL) {
        let URL = `/filter/${this.date1}/${this.date2}`;
        if (this.region && this.regionId) {
          URL += `/${this.region}/${this.regionId}`;
        }
        if (Object.keys(this.$route.params).length !== 0 ) {
          this.displayCustomErrorModal(`The date range provided is invalid. 
          Please use the date picker to select the desired date range.`);
        }
        this.$router.push(URL);
      }

      if (cache.get('rco')) {
        this.rcoArray = cache.get('rco');
      } else {
        let promise = queries.getRCOs();
        promise.then(
          response => {
          try {
            if (response.data.features.length > 0) {
              cache.set('rco', response.data.features);
              this.rcoArray = response.data.features;
            }
          } catch (err) {
            this.displayModal('getting the RCO data (CODE 006)', err);
          }
        });
      }
    },
    mounted() {
      this.datepicker1 = $(this.$refs.refDate1).fdatepicker({
          //initialDate: this.date1,
          format: 'yyyy-mm-dd'
        })
        .on('changeDate', this.changeDate1)
        .data('datepicker');

      this.datepicker2 = $(this.$refs.refDate2).fdatepicker({
          //initialDate: this.date2,
          format: 'yyyy-mm-dd',
          onRender (date) {
            return date.valueOf() <= homeStore.datepicker1.date.valueOf() ? 'disabled' : '';
          }
        })
        .on('changeDate', this.changeDate2)
        .data('datepicker');

      this.filter();
    },
    computed: {
      region: function() {
        let arr = this.regionSelect.split(':');
        return (arr[0]) ? arr[0] : '';
      },
      regionId: function() {
        let arr = this.regionSelect.split(':');
        return (arr[1]) ? arr[1] : '';
      }
    },
    methods: {
      changeDate1(ev) {
        this.date1 = moment(ev.date).utc().format(DATE_FORMAT);
        this.datepicker1.hide();
        this.changeURL();
      },
      changeDate2(ev) {
        this.date2 = moment(ev.date).utc().format(DATE_FORMAT);
        this.datepicker2.hide();
        this.changeURL();
      },
      changeURL() {
        let URL = `/filter/${this.date1}/${this.date2}`;
        if (this.region && this.regionId) {
          URL += `/${this.region}/${this.regionId}`;
        }

        this.$router.replace(URL);
      },
      filter() {
        //Update dates on table title
        this.displayDate1 = moment(this.date1).format('MM/DD/YYYY');
        this.displayDate2 = moment(this.date2).format('MM/DD/YYYY');
        this.loading = true;
        this.localRows = [];

        if (cache.get(this.$route.path)) {
          this.rowsCount = cache.get(this.$route.path).length;
          this.localRows = cache.get(this.$route.path);
          this.loading = false;
        } else {
          let sql = "";
          if (!this.region || !this.regionId) {
            queries.get(
                queries.CARTO_URL,
                {
                  q:queries.replace(
                    queries.strings.appealsByDate,
                    `${this.date1}T00:00:00Z`, // Please do not ask, it just works =/
                    `${this.date2}T23:59:59Z` // Please do not ask, it just works =/
                  )
                }
              )
              .then((response) => {
                let filterDataCollection = objects.getFilterResultsCollection(response.data.rows);
                cache.set(this.$route.path, filterDataCollection);
                this.rowsCount = filterDataCollection.length;
                this.localRows = filterDataCollection;
                this.loading = false;
              })
              .catch(err => {
                this.displayModal('filtering by date (CODE 005)', err);
              });
          } else {
            try {
              queries.getGeographyData(this.region, this.regionId)
                .then((response) => {
                  if(!response.data.error) {
                    const geometry = response.data.features[0].geometry.rings;
                    queries.post(
                        queries.CARTO_URL,
                        {
                          q: queries.replace(
                            queries.strings.appealsByDateAndRegion,
                            `${this.date1}T00:00:00Z`, // Please do not ask, it just works =/
                            `${this.date2}T23:59:59Z`, // Please do not ask, it just works =/
                            JSON.stringify(geometry)
                          )
                        }
                      )
                      .then((cartoResponse) => {
                        let dataRows = cartoResponse.data.rows;
                        let filterDataCollection = objects.getFilterResultsCollection(dataRows);
                        cache.set(this.$route.path, filterDataCollection);
                        this.rowsCount = filterDataCollection.length;
                        this.localRows = filterDataCollection;
                        this.loading = false;
                      })
                      .catch(err => {
                        this.displayModal('filtering by region (CODE: 001)', err);
                      });
                  }else{
                    this.displayModal('filtering by region (CODE: 002)', err);
                  }
                })
                .catch((err) => {
                  this.displayModal('filtering by region (CODE: 003)', err);
                });
            } catch (err) {
              this.displayModal('filtering by region (CODE: 004)', err);
            }
          }
        }
      },
      goToDetail(rowObject) {
        this.$emit('setZoningLink', this.$route.path);
        this.$router.push(`/appeals/${rowObject.appealno}`);
      },
      displayModal(text, err) {
        this.rowsCount = 0;
        this.localRows = [];
        this.modalMessage = `The application has encountered an unknown error ${text},
                            please try again, if the problem persists,
                            contact your system administrator.`;
        this.showModal=true;
      },
      displayCustomErrorModal(text) {
        this.modalMessage = text;
        this.showModal=true;
      },
    },
    watch: {
      '$route' (to, from) {
        this.filter();
      }
    }
  }
</script>
