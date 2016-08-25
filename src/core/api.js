
import classes              from './classes';
import utils                from './utils';
import { setDefaultOption } from './defaults';

const nativeSlice = Array.prototype.slice;

const api = {

    /**
     * ## buildFromUrl
     *
     * uses loadDataFromUrl and completes the entire build with the new data
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return _Void_
     */
    buildFromUrl( url, callback )
    {
        this.loadDataFromUrl( url, data =>
        {
            this.data = data;

            if ( callback )
            {
                callback( this.data );
            }

            this.rebuild( this.data );
        } );

        return [];
    },


    /**
     * ## clickByIndex
     *
     * programatically sets selected by index.  If there are not enough elements
     * to match the index, then nothing is selected. Fires the onClick event
     *
     * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    clickByIndex( index, multiple )
    {
        return this.setByIndex( index, multiple, false );
    },


    /**
     * ## clickByText
     *
     * programatically sets selected by text string.  If the text string
     * is not matched to an element, nothing will be selected. Fires the onClick event
     *
     * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    clickByText( text, multiple )
    {
        return this.setByText( text, multiple, false );
    },


    /**
     * ## clickByValue
     *
     * programatically sets selected by value string.  If the value string
     * is not matched to an element, nothing will be selected. Fires the onClick event
     *
     * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    clickByValue( value, multiple )
    {
        return this.setByValue( value, multiple, false );
    },


    /**
     * ## destroy
     *
     * removes flounder and all it`s events from the dom
     *
     * @return _Void_
     */
    destroy()
    {
        this.componentWillUnmount();

        let refs                = this.refs;
        let originalTarget      = this.originalTarget;
        let tagName             =  originalTarget.tagName;

        if ( tagName === `INPUT` || tagName === `SELECT` )
        {
            let target = originalTarget.nextElementSibling;

            if ( tagName === `SELECT` )
            {
                let firstOption = originalTarget[0];

                if ( firstOption && utils.hasClass( firstOption, classes.PLACEHOLDER ) )
                {
                    originalTarget.removeChild( firstOption );
                }
            }
            else
            {
                target = refs.flounder.parentNode;
            }

            try
            {
                target.parentNode.removeChild( target );
                originalTarget.tabIndex = 0;
                utils.removeClass( originalTarget, classes.HIDDEN );
            }
            catch( e )
            {
                throw ` : this flounder may have already been removed`;
            }
        }
        else
        {
            try
            {
                let wrapper = refs.wrapper;
                let parent  = wrapper.parentNode;
                parent.removeChild( wrapper );
            }
            catch( e )
            {
                throw ` : this flounder may have already been removed`;
            }
        }

        refs.flounder.flounder  = originalTarget.flounder = this.target.flounder = null;
    },


    /**
     * ## deselectAll
     *
     * deslects all data
     *
     * @return _Void_
     */
    deselectAll()
    {
        this.removeSelectedClass();
        this.removeSelectedValue();


        let multiTagWrapper = this.refs.multiTagWrapper;

        if ( multiTagWrapper )
        {
            let tags = nativeSlice.call( multiTagWrapper.children );
            tags.forEach( el => el.children[0].click() );
        }
    },


    /**
     * ## disable
     *
     * disables flounder by adjusting listeners and classes
     *
     * @param {Boolean} bool disable or enable
     *
     * @return _Void_
     */
    disable( bool )
    {
        let refs        = this.refs;
        let flounder    = refs.flounder;
        let selected    = refs.selected;

        if ( bool )
        {
            refs.flounder.removeEventListener( `keydown`, this.checkFlounderKeypress );
            refs.selected.removeEventListener( `click`, this.toggleList );
            utils.addClass( selected, classes.DISABLED );
            utils.addClass( flounder, classes.DISABLED );
        }
        else
        {
            refs.flounder.addEventListener( `keydown`, this.checkFlounderKeypress );
            refs.selected.addEventListener( `click`, this.toggleList );
            utils.removeClass( selected, classes.DISABLED );
            utils.removeClass( flounder, classes.DISABLED );
        }
    },


    /**
     * ## disableByIndex
     *
     * disables the options with the given index
     *
     * @param {Mixed} i index of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByIndex( index, reenable )
    {
        let refs = this.refs;

        if ( typeof index !== `string` && index.length )
        {
            let disableByIndex = this.disableByIndex.bind( this );
            return index.map( _i => disableByIndex( _i, reenable ) );
        }
        else
        {
            let data    = refs.data;
            let length  = data.length;

            if ( index < 0 )
            {
                let length  = data.length;
                index = length + index;
            }

            let el = data[ index ];

            if ( el )
            {
                let opt = refs.selectOptions[ index ];

                if ( reenable )
                {
                    opt.disabled = false;
                    utils.removeClass( el, classes.DISABLED );
                }
                else
                {
                    opt.disabled = true;
                    utils.addClass( el, classes.DISABLED );
                }

                return [ el, opt ];
            }
            else
            {
                console.warn( 'Flounder - No element to disable.' );
            }
        }
    },


    /**
     * ## disableByText
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByText( text, reenable )
    {
        if ( typeof text !== `string` && text.length )
        {
            let disableByText = this.disableByText.bind( this );
            let res = text.map( _v => disableByText( _v, reenable ) );

            return res.length === 1 ? res[0] : res;
        }
        else
        {
            let res     = [];

            this.refs.data.forEach( function( el, i )
            {
                let _elText = el.innerHTML;

                if ( _elText === text )
                {
                    res.push( i );
                }
            } );

            res = res.length === 1 ? res[0] : res;

            return this.disableByIndex( res, reenable );
        }
    },


    /**
     * ## disableByValue
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByValue( value, reenable )
    {
        if ( typeof value !== `string` && value.length )
        {
            let disableByValue = this.disableByValue.bind( this );
            let res = value.map( _v => disableByValue( _v, reenable ) );

            return res.length === 1 ? res[ 0 ] : res;
        }
        else
        {
            let res = this.refs.selectOptions.map( function( el, i )
            {
                return `${el.value}` === `${value}` ? i : null;
            } ).filter( a => !!a || a === 0 ? true : false );

            res = res.length === 1 ? res[0] : res;

            return this.disableByIndex( res, reenable );
        }
    },


    /**
     * ## enableByIndex
     *
     * shortcut syntax to enable an index
     *
     * @param {Mixed} index index of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByIndex( index )
    {
        return this.disableByIndex( index, true );
    },


    /**
     * ## enableByText
     *
     * shortcut syntax to enable by text
     *
     * @param {Mixed} text text of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByText( text )
    {
        return this.disableByText( text, true );
    },


    /**
     * ## enableByValue
     *
     * shortcut syntax to enable a value
     *
     * @param {Mixed} value value of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByValue( value )
    {
        this.disableByValue( value, true );
    },


    /**
     * ## getData
     *
     * returns the option and div tags related to an option
     *
     * @param {Number} _i index to return
     *
     * @return _Object_ option and div tage
     */
    getData( _i )
    {
        let refs = this.refs;

        if ( typeof _i === `number` )
        {
            return { option : refs.selectOptions[ _i ], div : refs.data[ _i ] };
        }
        else if ( _i && _i.length && typeof _i !== `string` )
        {
            return _i.map( i =>
            {
                return this.getData( i );
            } );
        }
        else if ( !_i )
        {
            return refs.selectOptions.map( ( el, i ) =>
            {
                return this.getData( i );
            } );
        }
        else
        {
            console.warn( 'Flounder - Illegal parameter type.' );
        }
    },


    /**
     * ## getSelected
     *
     * returns the currently selected data of a SELECT box
     *
     * @return _Void_
     */
    getSelected()
    {
        let _el         = this.refs.select;
        let opts        = [], opt;
        let _data       = _el.options;

        nativeSlice.call( _data ).forEach( el =>
        {
            if ( el.selected && !utils.hasClass( el, classes.PLACEHOLDER ) )
            {
                opts.push( el );
            }
        } );

        return opts;
    },


    /**
     * ## getSelectedValues
     *
     * returns the values of the currently selected data
     *
     * @return _Void_
     */
    getSelectedValues()
    {
        return this.getSelected().map( _v => _v.value )
    },


    /**
     * ## loadDataFromUrl
     *
     * loads data from a passed url
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return _Void_
     */
    loadDataFromUrl( url, callback )
    {
        utils.http.get( url ).then( data =>
        {
            if ( data )
            {
                this.data = JSON.parse( data );

                if ( callback )
                {
                    callback( this.data );
                }
            }
            else
            {
                console.warn( `no data recieved` );
            }
        } ).catch( e =>
        {
            console.warn( `something happened: `, e );
            this.rebuild( [ {
                        text        : ``,
                        value       : ``,
                        index       : 0,
                        extraClass  : classes.LOADING_FAILED
                    } ] );
        } );

        return [ {
            text        : ``,
            value       : ``,
            index       : 0,
            extraClass  : classes.LOADING
        } ];
    },


    /**
     * ## rebuild
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Array} data array with option information
     *
     * @return _Object_ rebuilt flounder object
     */
    rebuild( data, props )
    {
        if ( props || !props && ( typeof data === `string` ||
            ( data && typeof data.length !== `number` ) ) )
        {
            return this.reconfigure( data, props );
        }

        data            = this.data = data || this.data;
        props           = this.props;
        let refs        = this.refs;
        let _select     = refs.select;

        this.deselectAll();
        this.removeOptionsListeners();
        refs.select.innerHTML       = ``;
        refs.select                 = false;
        this._default               = setDefaultOption( this, props, data, true );
        refs.optionsList.innerHTML  = ``;

        [ refs.data, refs.selectOptions ] = this.buildData( this._default, this.data, refs.optionsList, _select );
        refs.select                 = _select;

        this.addOptionsListeners();
        this.data = data;

        this.displaySelected( refs.selected, refs );

        return this;
    },


    /**
     * ## setByIndex
     *
     * programatically sets the value by index.  If there are not enough elements
     * to match the index, then nothing is selected.
     *
     * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    setByIndex( index, multiple, programmatic = true )
    {
        let refs = this.refs;

        if ( typeof index !== `string` && index.length )
        {
            let setByIndex = this.setByIndex.bind( this );
            return index.map( _i => setByIndex( _i, multiple, programmatic ) );
        }
        else
        {
            let data    = this.data;
            let length  = data.length;

            if ( index < 0 )
            {
                let length  = data.length;
                index = length + index;
            }

            let el = refs.data[ index ];

            if ( el )
            {
                let isOpen = utils.hasClass( refs.wrapper, classes.OPEN );
                this.toggleList( isOpen ? `close` : `open` );
                this.___forceMultiple       = multiple && this.multiple;

                this.___programmaticClick   = programmatic;
                el.click();

                return el;
            }

            return null;
        }
    },


    /**
     * ## setByText
     *
     * programatically sets the text by string.  If the text string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    setByText( text, multiple, programmatic = true )
    {
        if ( typeof text !== `string` && text.length )
        {
            let setByText = this.setByText.bind( this );
            return text.map( _i => setByText( _i, multiple, programmatic ) );
        }
        else
        {
            let res = [];
            text    = `${text}`;

            this.refs.data.forEach( function( el, i )
            {
                let _elText = el.innerHTML;

                if ( _elText === text )
                {
                    res.push( i );
                }
            } );

            return this.setByIndex( res, multiple, programmatic );
        }
    },


    /**
     * ## setByValue
     *
     * programatically sets the value by string.  If the value string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    setByValue( value, multiple, programmatic = true )
    {
        if ( typeof value !== `string` && value.length )
        {
            let setByValue = this.setByValue.bind( this );
            return value.map( _i => setByValue( _i, multiple, programmatic ) );
        }
        else
        {
            let values = this.refs.selectOptions.map( function( el, i )
            {
                return `${el.value}` === `${value}` ? i : null;
            } ).filter( a => a === 0 || !!a );

            return this.setByIndex( values, multiple, programmatic );
        }
    }
};

export default api;

